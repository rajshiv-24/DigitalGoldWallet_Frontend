// ─────────────────────────────────────────────
// Derived strictly from backend DTOs provided.
// UserRequestDTO and UserResponseDTO fields are
// NOT yet provided — update when shared.
// Role enum values are NOT yet provided —
// typed as string until enum file is shared.
// ─────────────────────────────────────────────

/**
 * Maps to: com.cg.dto.LoginRequestDTO
 * POST /api/auth/login — request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Maps to: com.cg.dto.AuthResponseDTO
 * POST /api/auth/login — response body
 *
 * NOTE: The `message` field carries the raw JWT token string.
 * Confirmed from AuthController:
 *   new AuthResponseDTO(token, userId, name, email, role)
 */
export interface AuthResponse {
  message: string;   // JWT token — field named 'message' in backend DTO
  userId: number;    // Java Integer → TypeScript number
  name: string;
  email: string;
  role: string;      // com.cg.enums.Role — update to union type once enum is provided
}

/**
 * Internal session model stored in localStorage.
 * Remaps AuthResponse.message → token for clarity.
 */
export interface AuthenticatedUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;      // Update to Role union type once enum is provided
}

/**
 * Maps to: com.cg.dto.UserRequestDTO
 * POST /api/auth/register — request body
 * ⚠️ Fields NOT yet provided — populate when UserRequestDTO is shared
 */
export interface RegisterRequest {
  // TODO: Add fields from UserRequestDTO
  [key: string]: unknown;
}

/**
 * Maps to: com.cg.dto.UserResponseDTO
 * POST /api/auth/register — response body (HTTP 201)
 * ⚠️ Fields NOT yet provided — populate when UserResponseDTO is shared
 */
export interface RegisterResponse {
  // TODO: Add fields from UserResponseDTO
  [key: string]: unknown;
}