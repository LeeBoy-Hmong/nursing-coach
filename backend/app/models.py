## This is the single source of truth for all of our data shape.
import uuid
from typing import ClassVar
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, Text, Index, func

class StudyItem(SQLModel, table=True):
    __tablename__: ClassVar[str] = "study_item"  # Change the tablename is now generated as "study_item" instead of "studyitem" (typical naming conven of SQLMol)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID | None = Field(default=None) # The field is nullable (uuid.UUID | None) - if an input is not provided, the last "None" states it as optional to fill in.
    type: str = Field(sa_type=Text)
    title: str = Field(sa_type=Text)
    topic: str | None = Field(default=None, sa_type=Text)
    source_type: str = Field(default="ai_generated", sa_type=Text)
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
    study_item_id: uuid.UUID = Field(
        foreign_key="study_item.id",
        ondelete="CASCADE",  # Without this, Alembic stips my cascade.
        index=True)  # idx_quiz_question_study_item_id
    question: str = Field(sa_type=Text)
    answer: str = Field(sa_type=Text)
    position: int
    study_item: "StudyItem" = Relationship(back_populates="questions") # So that the query authorship could be done in Python. DB does the joining still -- SQLAlchemy generates the SQL.
    __table_args__ = (
        Index("idx_quiz_question_item_position", "study_item_id", "position", unique=True),  # The trailing comma is needed to make it a tuple.
    )

class MedCard(SQLModel, table=True):
    __tablename__: ClassVar[str] = "med_card"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    study_item_id: uuid.UUID = Field(
        foreign_key="study_item.id",
        ondelete="CASCADE",
        index=True,
        unique=True,  # One med card per study_item
    )
    generic_name: str = Field(sa_type=Text)
    brand_name: str | None = Field(default=None, sa_type=Text)
    drug_class: str | None = Field(default=None, sa_type=Text)
    dose: str | None = Field(default=None, sa_type=Text)
    route: str | None = Field(default=None, sa_type=Text)
    frequency: str | None = Field(default=None, sa_type=Text)
    mechanism_of_action: str | None = Field(default=None, sa_type=Text) 
    contraindications: str | None = Field(default=None, sa_type=Text)
    adverse_effects: str | None = Field(default=None, sa_type=Text)
    nursing_considerations: str | None = Field(default=None, sa_type=Text)
    patient_teaching: str | None = Field(default=None, sa_type=Text)
    labs_to_monitor: str | None = Field(default=None, sa_type=Text)
    rxcui: str | None = Field(default=None, sa_type=Text, index=True)
    external_verified_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True)) # type: ignore
    indication: str | None = Field(default=None, sa_type=Text)

# Create a class to describe one question in the respone. Call is "QuizeQuestionRead"
# this is not a table it's a description of a JSON shape
# Give it 4 attributes -- id, position, answer, question
class QuizQuestionRead(SQLModel, table=False):
    id: uuid.UUID
    question: str
    answer: str
    position: int 


# Create a class to describe it's quiz WITH its questions. Call it "StudyItemRead"
class StudyItemRead(SQLModel, table=False):
    id: uuid.UUID
    type: str
    title: str 
    topic: str | None = Field(default=None, sa_type=Text)
    source_type: str
    created_at: datetime
    questions : list[QuizQuestionRead] = []