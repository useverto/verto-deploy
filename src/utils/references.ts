import { readFileSync } from "fs";
import { join } from "path";

export class ReferenceFixer {
  private src: string;
  private level: number;

  private readonly slashes: string;

  constructor(src: string, level: number) {
    this.src = src;
    this.level = level;
    this.slashes = "../".repeat(level);
  }

  public getSrc(): string {
    this.replaceBase();
    this.replaceHrefs();
    this.replaceSrcs();
    this.replaceEmbededScriptSources();
    this.fixRemainingHrefsAndSrcs();

    return this.src;
  }

  private replaceBase() {
    this.src = this.src.replace(
      "<base href=/ >",
      `<base href=${this.level ? this.slashes : "./"} >`
    ); // todo make this relative to level
  }

  private replaceHrefs() {
    this.src = this.src.replace(
      new RegExp("(href=)/", "g"),
      `href=${this.level ? this.slashes : "./"}`
    );
    this.src = this.src.replace(
      new RegExp('(href=")/', "g"),
      `href="${this.level ? this.slashes : "./"}`
    );
  }

  private replaceEmbededScriptSources() {
    this.src = this.src.replace(
      /(?<=(<script\b[^>]*>([\s\S]*?))([\"|\'|\`]))(\/)(?=(.*)(\.js))(?=(([\s\S]*?)(<\/script>)))/gm,
      this.level ? this.slashes : "./"
    );
  }

  private replaceSrcs() {
    this.src = this.src.replace(
      new RegExp("(src=)/", "g"),
      `src=${this.level ? this.slashes : "./"}`
    );
    this.src = this.src.replace(
      new RegExp('(src=")/', "g"),
      `src="${this.level ? this.slashes : "./"}`
    );
  }

  private fixRemainingHrefsAndSrcs() {
    const deploy_script = new TextDecoder().decode(
      readFileSync(join(__dirname, "../../assets/deploy_script.js"))
    );
    // this script will be injected to replace hrefs
    const fixer = `</script><script>${deploy_script}</script>`;
    //inject after last script tag
    this.src = this.src.replace(/(<\/script>)( *)$/, fixer);
  }
}

export class CssReferenceFixer {
  private src: string;
  private level: number;

  private readonly slashes: string;

  constructor(src: string, level: number) {
    this.src = src;
    this.level = level;
    this.slashes = "../".repeat(level);
  }

  public getSrc(): string {
    this.replaceUrls();

    return this.src;
  }

  private replaceUrls() {
    this.src = this.src.replace(
      /(?<=(url\((["|']?)( *)))(\/)(?=(([^ ])*)(["|']?)(\)))/g,
      this.level ? this.slashes : "./"
    );
  }
}

export class JavaScriptReferenceFixer {
  private src: string;
  private routes: string[];

  // routes are needed to check for references in js
  constructor(src: string, routes: string[]) {
    this.src = src;
    this.routes = routes;
  }

  public getSrc(): string {
    this.replaceHrefs();
    this.replaceRootHrefs();

    return this.src;
  }

  private replaceHrefs() {
    for (const route of this.routes) {
      const routeWithoutSlash = route.replace(/(^\/)/, "");

      this.src = this.src.replace(
        new RegExp(`(")((\/?)${routeWithoutSlash})(?=[\/|"|?])`, "g"),
        `"/"+window.location.href.split('/')[3]+"/${routeWithoutSlash}`
      );
      this.src = this.src.replace(
        new RegExp(`(')((\/?)${routeWithoutSlash})(?=[\/|'|?])`, "g"),
        `"/"+window.location.href.split('/')[3]+'/${routeWithoutSlash}`
      );
      this.src = this.src.replace(
        new RegExp(`(\`)((\/?)${routeWithoutSlash})(?=[\/|\`|?])`, "g"),
        `"/"+window.location.href.split('/')[3]+\`/${routeWithoutSlash}`
      );
    }
  }

  private replaceRootHrefs() {
    this.src = this.src.replace(
      new RegExp('(?<=("href",( ?)))("/")', "g"),
      '"/"+window.location.href.split("/")[3]+"/"'
    );
  }
}
