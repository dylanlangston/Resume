import path from "path";

export const Configuration = class {
    public static readonly OUT_DIR = path.resolve("../out");
    public static readonly PDF_PATH = path.join(this.OUT_DIR, "resume.pdf");
    public static readonly PROFESSIONAL_PDF_PATH = path.join(this.OUT_DIR, "professional.pdf");
    public static readonly HTML_PATH = path.join(this.OUT_DIR, "resume.html");
    public static readonly TXT_PATH = path.join(this.OUT_DIR, "resume.txt");
    public static readonly MD_PATH = path.join(this.OUT_DIR, "resume.md");
    public static readonly POLYGLOT_PATH = path.join(this.OUT_DIR, "resume.md.html.pdf");
}