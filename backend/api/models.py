from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import SessionLocal, engine, Base
import models


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    storyboards = relationship("Storyboard", back_populates="owner_user")


class Storyboard(Base):
    __tablename__ = "storyboards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    thumbnail = Column(String, index=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    owner_user = relationship("User", back_populates="storyboards")
    owner_images = relationship("Image", back_populates="storyboard")


class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    storyboard_id = Column(Integer, ForeignKey("storyboards.id"))
    image_path = Column(String)
    caption = Column(String)

    storyboard = relationship("Storyboard", back_populates="owner_images")


models.Base.metadata.create_all(bind=engine)
