from app.schemas.session import Session
from app.exceptions import SessionNotFoundError
from typing import Dict
class MemorySessionStore:
    """
    this is to track the activev mock interviews.
    """
    def __init__(self):
        self._sessions:Dict[str, Session] = {}
    def add_session(self, session: Session)->Session:
        """Add the session into the memory session"""
        self._sessions[session.session_id] = session
        return session
    
    def get_session(self, session_id:str)->Session:
        """
            etrieves a session by its unique ID.
            Raises SessionNotFoundError if the session does not exist.
        """
        session = self._sessions.get(session_id)
        if not session:
            raise SessionNotFoundError(f"Session with ID '{session_id}' not found.")
        return session
    def update_session(self, session: Session) -> Session:
        """
        Updates an existing session's state.
        Raises SessionNotFoundError if the session is not registered.
        """
        if session.session_id not in self._sessions:
            raise SessionNotFoundError(f"Cannot update: Session with ID '{session.session_id}' not found.")
        self._sessions[session.session_id] = session
        return session
    def delete_session(self, session_id: str) -> None:
        """
        Deletes a session from the memory store.
        Raises SessionNotFoundError if the session does not exist.
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Cannot delete: Session with ID '{session_id}' not found.")
        del self._sessions[session_id]
    def exists(self, session_id: str) -> bool:
        """
        Quick check to see if a session exists.
        """
        return session_id in self._sessions
    
session_store = MemorySessionStore()