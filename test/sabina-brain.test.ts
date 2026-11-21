import { describe, expect, it } from "vitest";
import { detectLang, localReply } from "@/components/sabina/sabina-brain";

describe("Sabina offline brain", () => {
  it("sends emergencies to 911 in Arabic", () => {
    const r = localReply("عندي ألم في الصدر وضيق تنفس", "ar");
    expect(r.intent).toBe("emergency");
    expect(r.text).toContain("911");
  });

  it("sends emergencies to 911 in English", () => {
    expect(localReply("I have chest pain", "en").intent).toBe("emergency");
  });

  it("maps knee pain (with Arabic prefixes) to orthopedics", () => {
    const r = localReply("بركبتي وجع من أسبوع", "ar");
    expect(r.intent).toBe("specialty");
    expect(r.text).toContain("العظام");
  });

  it("does not treat words that merely start with 'hi' as a greeting", () => {
    expect(localReply("history", "en").intent).toBe("fallback");
  });

  it("detects the visitor's language", () => {
    expect(detectLang("مرحبا", "en")).toBe("ar");
    expect(detectLang("hello", "ar")).toBe("en");
  });
});
