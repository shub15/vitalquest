# Project Reference Materials

## Health Connect Integration
We use the Health Connect SDK to handle user health data.

| Resource | Description |
| :--- | :--- |
| [Integration Guide](https://developer.android.com/health-and-fitness/health-connect) | How to setup the client and manifest permissions. |
| [Data Types](https://developer.android.com/health-and-fitness/health-connect/data-types) | List of available data types (Steps, Heart Rate, Sleep, etc.). |
| [Testing Guide](https://developer.android.com/health-and-fitness/health-connect/test-your-app) | How to use the automated testing library. |

## AI & Model Documentation
This project leverages the Google Gemini API for generative AI features. Refer to the official resources below:

- **[Gemini API Docs](https://ai.google.dev/gemini-api/docs)**: Main guide for text, vision, and multimodal generation.
- **[API Reference](https://ai.google.dev/api)**: Detailed reference for the REST API and Client SDKs (Python, Node.js, Go, Dart).
- **[Prompt Design Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)**: Best practices for optimizing model responses (few-shot, chain-of-thought, etc.).
- **[Gemini Cookbook](https://github.com/google-gemini/cookbook)**: Official repository of code snippets and advanced examples.

## API Documentation
This project uses **FastAPI**.

- **[FastAPI Documentation](https://fastapi.tiangolo.com)**: The official guide for features, security, and deployment.
- **[Interactive API Docs](/docs)**: Once the app is running, visit `http://localhost:8000/docs` (Swagger UI) to test endpoints interactively.
- **[Alternative Docs](/redoc)**: Visit `http://localhost:8000/redoc` for the ReDoc reference view.
- **[Pydantic Documentation](https://docs.pydantic.dev)**: Reference for data schemas and validation models used in this project.

## Firebase Resources
This project uses Firebase as its backend-as-a-service.

- **[Firebase Console](https://console.firebase.google.com/)**: Manage the project, view data, and deploy manually.
- **[Authentication Guide](https://firebase.google.com/docs/auth)**: Details on the sign-in providers (Google, Email/Pass) used in this app.
- **[Firestore Docs](https://firebase.google.com/docs/firestore)**: Reference for our NoSQL document database structure.
- **[Security Rules](https://firebase.google.com/docs/rules)**: Logic determining who can read/write data.
- **[Cloud Functions](https://firebase.google.com/docs/functions)**: Documentation for the backend triggers and API endpoints.

### Data Validation: Pydantic
This project uses **Pydantic V2** for data modeling and validation.
- **[Pydantic Docs](https://docs.pydantic.dev)**: Reference for `BaseModel`, field types, and validators.
- **[Settings Management](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)**: How we handle environment variables using `BaseSettings`.

### Testing: Pytest
We use **pytest** for unit and integration testing.
- **[Pytest Documentation](https://docs.pytest.org/)**: Guide on writing tests, assertions, and parameterized tests.
- **[Fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)**: Understanding dependency injection in our test suite.
- **Running Tests**: Run `pytest` in the terminal to execute all tests in the `tests/` directory.

### Configuration: python-dotenv
We use **python-dotenv** to manage secrets and config during development.
- **[Usage Guide](https://pypi.org/project/python-dotenv/)**: How to structure your `.env` file.
- **Setup**: 
  1. Copy `.env.example` to `.env`.
  2. Add your local secrets (API keys, DB URLs).
  3. **Never** commit `.env` to Git.