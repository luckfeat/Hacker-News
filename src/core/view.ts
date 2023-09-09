export default abstract class View {
  private template: string;
  private renderTemplate: string;
  private root: HTMLElement;
  private htmlList: string[];
  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
      throw '최상위 컨테이너를 찾을 수 없습니다.';
    }

    this.root = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected updateView(): void {
    this.root.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  }

  protected addHTML(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  protected getHTML(): string {
    const snapshot = this.htmlList.join();
    this.clearHtmlList();
    return snapshot;
  }

  protected clearHtmlList(): void {
    this.htmlList = [];
  }

  protected setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  abstract render(): void;
}
