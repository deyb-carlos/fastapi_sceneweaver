from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from schemas import (
    UserCreate,
    UserOut,
    StoryboardCreate,
    StoryboardOut,
    StoryboardCreateNoOwner,
)
import auth, database, storyboards
from PIL import Image
from fastapi.responses import StreamingResponse
from io import BytesIO
import random
from typing import List
import models
import secrets
import string
from reset_password import send_reset_email

app = FastAPI()


origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = auth.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user_email = auth.get_user_by_email(db, user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    try:
        created_user = auth.create_user(db=db, user=user)
        return {
            "id": created_user.id,
            "username": created_user.username,
            "email": created_user.email,
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Error while creating user. Please try again later."
        )


@app.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=7)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/refresh-token")
def refresh_token(token: str = Depends(auth.oauth2_scheme)):
    try:
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(SessionLocal(), username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        access_token_expires = timedelta(days=7)
        access_token = auth.create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/verify-token")
async def verify_user_token(token: str = Depends(auth.oauth2_scheme)):
    auth.verify_token(token=token)
    return {"message": "Token is valid"}


@app.get("/me")
async def get_current_user(
    token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)
):
    try:
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.post("/home", response_model=StoryboardOut)
def create_storyboard(
    storyboard: StoryboardCreateNoOwner,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme),
):
    try:

        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        existing_storyboard = (
            db.query(models.Storyboard)
            .filter(
                models.Storyboard.owner_id == user.id,
                models.Storyboard.name == storyboard.name,
            )
            .first()
        )

        if existing_storyboard:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Storyboard with this name already exists",
            )

        db_storyboard = models.Storyboard(
            name=storyboard.name,
            owner_id=user.id,
            thumbnail="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/tumblr_f62bc01ba9fb6acf8b5d438d6d2ae71a_c5a496d1_1280.jpg",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(db_storyboard)
        db.commit()
        db.refresh(db_storyboard)
        return db_storyboard

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating storyboard: {str(e)}",
        )


@app.patch("/storyboard/{storyboard_id}")
def rename_storyboard(
    storyboard_id: int,
    storyboard: StoryboardCreateNoOwner,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme),
):
    try:
        # Verify token and get current user
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        # Get existing storyboard
        db_storyboard = (
            db.query(models.Storyboard)
            .filter(
                models.Storyboard.id == storyboard_id,
                models.Storyboard.owner_id == user.id,
            )
            .first()
        )

        if not db_storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found or not owned by user",
            )

        # Update storyboard
        db_storyboard.name = storyboard.name
        db_storyboard.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_storyboard)
        return db_storyboard

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating storyboard: {str(e)}",
        )


@app.delete("/storyboard/{storyboard_id}")
def delete_storyboard(
    storyboard_id: int,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme),
):
    try:
        # Verify token and get current user
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        # Find and delete storyboard
        db_storyboard = (
            db.query(models.Storyboard)
            .filter(
                models.Storyboard.id == storyboard_id,
                models.Storyboard.owner_id == user.id,
            )
            .first()
        )

        if not db_storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found or not owned by user",
            )

        db.delete(db_storyboard)
        db.commit()
        return {"message": "Storyboard deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting storyboard: {str(e)}",
        )


@app.get("/home", response_model=List[StoryboardOut])
def get_user_storyboards(
    db: Session = Depends(database.get_db), token: str = Depends(auth.oauth2_scheme)
):
    try:
        # Verify token and get current user
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Get all storyboards for the user
        storyboards = (
            db.query(models.Storyboard)
            .filter(models.Storyboard.owner_id == user.id)
            .all()
        )

        # Return empty array if no storyboards exist
        return storyboards or []

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching storyboards: {str(e)}",
        )


@app.get("/storyboard/{storyboard_id}/{name}", response_model=StoryboardOut)
def get_storyboard(
    storyboard_id: int,
    name: str,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme),
):
    try:
        # Verify token and get current user
        username = auth.verify_token_string(token)
        user = auth.get_user_by_username(db, username)

        # Get the storyboard
        db_storyboard = (
            db.query(models.Storyboard)
            .filter(
                models.Storyboard.id == storyboard_id,
                models.Storyboard.owner_id == user.id,
                models.Storyboard.name == name,
            )
            .first()
        )

        if not db_storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found or not owned by user",
            )

        return db_storyboard

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching storyboard: {str(e)}",
        )


@app.post("/forgot-password")
async def forgot_password(
    background_tasks: BackgroundTasks,
    username: str = Form(...),
    db: Session = Depends(database.get_db),
):

    user = auth.get_user_by_username(db, username)
    if not user:
        return {"message": "A reset link has been sent"}

    alphabet = string.ascii_letters + string.digits
    token = "".join(secrets.choice(alphabet) for _ in range(32))

    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    db_token = models.PasswordResetToken(
        email=user.email, token=token, expires_at=expires_at
    )
    db.add(db_token)
    db.commit()

    background_tasks.add_task(send_reset_email, email=user.email, token=token)

    return {"message": "A reset link has been sent"}


@app.post("/reset-password")
async def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(database.get_db),
):
    # Verify token
    db_token = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token == token,
            models.PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )

    # Get user by email
    user = auth.get_user_by_email(db, db_token.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User not found"
        )

    # Update password
    hashed_password = auth.get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.commit()

    # Delete the used token
    db.delete(db_token)
    db.commit()

    return {"message": "Password updated successfully"}
