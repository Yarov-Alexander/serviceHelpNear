from pydantic import BaseModel, ConfigDict, EmailStr

from app.modules.users.models import UserRole


class UserRead(BaseModel):

    model_config = ConfigDict(from_attributes=True)  # позволяет собрать из объекта SQLAlchemy

    id: int
    email: EmailStr
    role: UserRole
