from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    storyboards: List["StoryboardOut"] = []

    model_config = {"from_attributes": True}


class StoryboardCreate(BaseModel):
    name: str
    owner_id: int


class StoryboardOut(BaseModel):
    id: int
    name: str
    owner_id: int
    owner: Optional[UserOut] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    thumbnail: str

    model_config = {"from_attributes": True}

class StoryboardCreateNoOwner(BaseModel):
    name: str  # Used in the new endpoints

class ImageCreate(BaseModel):
    storyboard_id: int

class ImageOut(BaseModel):
    id: int
    image_path: str
    caption: str
    storyboard_id: int
    storyboard: Optional[StoryboardOut] = None

    model_config = {"from_attributes": True}

class ResetTokenCreate(BaseModel):
    email: EmailStr
    token: str
    expires_at: datetime



