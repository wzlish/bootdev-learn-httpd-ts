import {
  vi,
  afterEach,
  beforeEach,
  describe,
  it,
  expect,
  beforeAll,
} from "vitest";
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  validateJWT,
} from "./auth.js";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "notacorrectpassword";
  let hash1: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1, 11);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});

const mock_date = new Date("1970-01-01T00:00:00Z").getTime();

describe("JWT Functions", () => {
  const secret = "salmon4life";
  const user_id = "boots";
  const expires_in = 3600;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mock_date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("makeJWT", () => {
    it("should create a valid JWT", () => {
      const token = makeJWT(user_id, expires_in, secret);
      expect(token).toBeTypeOf("string");
      expect(token.length).toBeGreaterThan(0);

      const decoded = jwt.verify(token, secret) as JwtPayload;
      expect(decoded.iss).toBe("chirpy");
      expect(decoded.sub).toBe(user_id);
      expect(decoded.iat).toBe(Math.floor(mock_date / 1000));
      expect(decoded.exp).toBe(Math.floor(mock_date / 1000) + expires_in);
    });

    it("should create a token that expires correctly", () => {
      const expiresInShort = 10;
      const token = makeJWT(user_id, expiresInShort, secret);
      vi.advanceTimersByTime((expiresInShort + 1) * 1000);
      expect(() => validateJWT(token, secret)).toThrow("Invalid Token.");
    });
  });

  describe("validateJWT", () => {
    it("should successfully validate a correct JWT and return the user ID", () => {
      const token = makeJWT(user_id, expires_in, secret);
      const decodedUserId = validateJWT(token, secret);
      expect(decodedUserId).toBe(user_id);
    });

    it("should throw an error for an invalid secret", () => {
      const token = makeJWT(user_id, expires_in, secret);
      const WRONG_secret = "wrong_secret";

      expect(() => validateJWT(token, WRONG_secret)).toThrow("Invalid Token.");
    });

    it("should throw an error for an expired JWT", () => {
      const expiresInShort = 1;
      const token = makeJWT(user_id, expiresInShort, secret);
      vi.advanceTimersByTime((expiresInShort + 1) * 1000);
      expect(() => validateJWT(token, secret)).toThrow("Invalid Token.");
    });

    it('should throw an error if the token payload is missing "sub"', () => {
      const tokenWithoutSub = jwt.sign(
        {
          iss: "chirpy",
          iat: Math.floor(mock_date / 1000),
          exp: Math.floor(mock_date / 1000) + expires_in,
        },
        secret,
      );
      expect(() => validateJWT(tokenWithoutSub, secret)).toThrow(
        "Invalid Token.",
      );
    });

    it("should throw an error for an empty token string", () => {
      const emptyToken = "";
      expect(() => validateJWT(emptyToken, secret)).toThrow("Invalid Token.");
    });
  });
});
