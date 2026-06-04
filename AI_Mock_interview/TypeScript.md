

## What is an Interface?

An interface defines the shape of an object.

It tells TypeScript:

```text
"This object must contain these fields and these data types."
```

Example:

```ts
interface STTMessage {
    transcript: string;
    is_final: boolean;
    confidence: number;
}
```

This means every `STTMessage` object must contain:

| Field      | Type    |
| ---------- | ------- |
| transcript | string  |
| is_final   | boolean |
| confidence | number  |

---

## Why Use Interfaces?

### Type Safety

TypeScript can detect mistakes before running the code.

Valid:

```ts
const msg: STTMessage = {
    transcript: "Hello",
    is_final: true,
    confidence: 0.92
};
```

Invalid:

```ts
const msg: STTMessage = {
    transcript: "Hello",
    is_final: "yes",
    confidence: 0.92
};
```

Error:

```text
Type 'string' is not assignable to type 'boolean'
```

---

## Interface vs Python Pydantic Models

FastAPI:

```python
class TranscriptResponse(BaseModel):
    transcript: str
    is_final: bool
    confidence: float
```

Frontend:

```ts
interface STTMessage {
    transcript: string;
    is_final: boolean;
    confidence: number;
}
```

Conceptually they serve the same purpose:

```text
Define the structure of data.
```

---

# Type Aliases

A type alias creates a reusable type definition.

Example:

```ts
type UserId = string;
```

Now:

```ts
const id: UserId = "123";
```

---

# Function Types

TypeScript can define the shape of a function.

Example:

```ts
type STTCallback = (data: STTMessage) => void;
```

Meaning:

```text
Input:
    STTMessage

Output:
    nothing (void)
```

Equivalent function:

```ts
function callback(data: STTMessage): void {
    console.log(data.transcript);
}
```

---

## Callback Example

```ts
const handleTranscript: STTCallback = (data) => {
    console.log(data.transcript);
};
```

TypeScript automatically knows:

```ts
data.transcript
data.is_final
data.confidence
```

exist.

---

# What Does `void` Mean?

```ts
(data: STTMessage) => void
```

means:

```text
Function does not return anything.
```

Example:

```ts
function greet(): void {
    console.log("Hello");
}
```

---

# Event Callback Type

Example:

```ts
type STTErrorCallback = (event: Event) => void;
```

Meaning:

```text
Input:
    Event

Output:
    Nothing
```

Example:

```ts
const handleError: STTErrorCallback = (event) => {
    console.error(event);
};
```

---

# Export Keyword

Example:

```ts
export interface STTMessage
```

or

```ts
export type STTCallback
```

Meaning:

```text
Allow other files to import and use this type.
```

Example:

```ts
import { STTMessage } from "./types";
```

---

# Arrow Functions

Example:

```ts
(data: STTMessage) => void
```

Read as:

```text
Takes STTMessage
returns nothing
```

General form:

```ts
(parameter) => returnType
```

Examples:

```ts
(number) => string

(string) => boolean

(STTMessage) => void
```

---

# WebSocket Example

Suppose backend sends:

```json
{
  "transcript": "Hello world",
  "is_final": true,
  "confidence": 0.95
}
```

Frontend:

```ts
socket.onmessage = (event) => {

    const data: STTMessage =
        JSON.parse(event.data);

    console.log(data.transcript);
};
```

Benefits:

```text
Autocomplete
Type checking
Safer refactoring
Less debugging
```

---

# Common React Usage

Define API response types:

```ts
interface QuestionResponse {
    session_id: string;
    question: string;
    question_number: number;
    is_complete: boolean;
}
```

Use:

```ts
const [question, setQuestion] =
    useState<QuestionResponse | null>(null);
```

---

# Interview Project Usage

### STT

```ts
interface STTMessage {
    transcript: string;
    is_final: boolean;
    confidence: number;
}
```

### Question Response

```ts
interface QuestionResponse {
    session_id: string;
    question: string;
    question_type: string;
    question_number: number;
    is_complete: boolean;
}
```

### TTS Request

```ts
interface TTSRequest {
    text: string;
    session_id: string;
}
```

---

# Key Takeaways

1. Interface defines object structure.
    
2. Type alias defines reusable types.
    
3. Function types describe function signatures.
    
4. Export allows usage across files.
    
5. Interfaces are similar to Pydantic schemas.
    
6. TypeScript catches many bugs before runtime.
    
7. Strong typing is especially useful for API responses and WebSocket messages.