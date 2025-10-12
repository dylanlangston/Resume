import path from "path";

export const Configuration = class {
    public static readonly OUT_DIR = path.resolve("../out");
    public static readonly PDF_PATH = path.join(this.OUT_DIR, "resume.pdf");
    public static readonly PDF_DARK_PATH = path.join(this.OUT_DIR, "resume_dark.pdf");
    public static readonly PROFESSIONAL_PDF_PATH = path.join(this.OUT_DIR, "professional.pdf");
    public static readonly HTML_PATH = path.join(this.OUT_DIR, "resume.html");
    public static readonly TXT_PATH = path.join(this.OUT_DIR, "resume.txt");
    public static readonly MD_PATH = path.join(this.OUT_DIR, "resume.md");
    public static readonly POLYGLOT_PATH = path.join(this.OUT_DIR, "resume.md.html.pdf");
    public static readonly POLYGLOT_DARK_PATH = path.join(this.OUT_DIR, "resume_dark.md.html.pdf");
    public static readonly SCREENSHOT_PATH = path.join(this.OUT_DIR, "screenshot.webp");
    public static readonly SCREENSHOT_TRANSPARENT_PATH = path.join(this.OUT_DIR, "screenshot_transparent.webp");
    public static readonly SCREENSHOT_TRANSPARENT_DARK_PATH = path.join(this.OUT_DIR, "screenshot_transparent_dark.webp");
    public static readonly SCREENSHOT_DARK_PATH = path.join(this.OUT_DIR, "screenshot_dark.webp");
    public static readonly SOCIAL_PREVIEW_PATH = path.join(this.OUT_DIR, "social-preview.png");
}