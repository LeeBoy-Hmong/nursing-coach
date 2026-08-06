## This is the single source of truth for all of our data shape.
import uuid
from typing import ClassVar
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, func

class StudyItem(SQLModel, table=True):
    __tablename__: ClassVar[str] = "study_item"  # Change the tablename is now generated as "study_item" instead of "studyitem" (typical naming conven of SQLMol)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID | None = None # The field is nullable (uuid.UUID | None) - if an input is not provided, the last "None" states it as optional to fill in.
    type: str
    title: str
    topic: str | None = None
    source_type: str = "ai_generated"
    created_at: datetime = Field(  # Created a default so that our Postgres would know what to put in.
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    questions: list["QuizQuestion"] = Relationship(back_populates="study_item")  # Build a connected realional data to the quiz_question table's foreign key (study_item_id).

class QuizQuestion(SQLModel, table=True):
    __tablename__: ClassVar[str] = "quiz_question"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    study_item_id: uuid.UUID = Field(foreign_key="study_item.id")
    question: str
    answer: str
    position: int
    study_item: "StudyItem" = Relationship(back_populates="questions") # So that the query authorship could be done in Python. DB does the joining still -- SQLAlchemy generates the SQL.

class MedCard(SQLModel, table=True):
    __tablename__: ClassVar[str] = "med_card"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    study_item_id: uuid.UUID = Field(foreign_key="study_item.id")
    generic_name: str
    brand_name: str | None = None
    drug_class: str | None = None
    dose: str | None = None
    route: str | None = None
    frequency: str | None = None
    mechanism_of_action: str | None = None 
    contraindications: str | None = None
    adverse_effects: str | None = None
    nursing_considerations: str | None = None
    patient_teaching: str | None = None
    labs_to_monitor: str | None = None
    rxcui: str | None = None
    external_verified_at: datetime | None = None
    indication: str | None = None
