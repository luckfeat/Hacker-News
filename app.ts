type Store = {
  currentPage: number;
  feeds: NewsFeed[];
};

type News = {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;
};

type NewsFeed = News & {
  comments_count: number;
  points: number;
  read?: boolean;
};

type NewsDetail = News & {
  comments: NewsComment[];
};

type NewsComment = News & {
  comments: NewsComment[];
  level: number;
};

type RouteInfo = {
  path: string;
  page: View;
};

const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const root: HTMLElement | null = document.querySelector('#root');
const div = document.createElement('div');
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function applyApiMixinx(targetClass: any, baseClasses: any[]): void {
  baseClasses.forEach((baseClass) => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        baseClass.prototype,
        name
      );

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}

class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
  }
}

class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
  }
}

class NewsDetailApi {
  getData(id: string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
  }
}

interface NewsDetailApi extends Api {}
interface NewsFeedApi extends Api {}
applyApiMixinx(NewsFeedApi, [Api]);
applyApiMixinx(NewsDetailApi, [Api]);

abstract class View {
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

class Router {
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;

  constructor() {
    window.addEventListener('hashchange', this.route.bind(this));

    this.routeTable = [];
    this.defaultRoute = null;
  }

  setDefaultPage(page: View) {
    this.defaultRoute = { path: '', page };
  }

  addRoutePath(path: string, page: View): void {
    this.routeTable.push({ path, page });
  }

  route() {
    const routePath = location.hash;

    if (routePath === '' && this.defaultRoute) {
      this.defaultRoute.page.render();
    }

    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }
}

class NewsFeedView extends View {
  private api: NewsFeedApi;
  private feeds: NewsFeed[];
  constructor(containerId: string) {
    let template: string = /* html */ `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold"><a href='#'>Hacker News</a></h1>
            </div>
            <div class="pagination items-center justify-end">
              <a class="prev text-gray-500">
              </a>
              <a class="next text-gray-500 ml-4">
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__feed__}}        
      </div>
    </div>
  `;
    super(containerId, template);
    this.api = new NewsFeedApi();
    this.feeds = store.feeds;
    if (this.feeds.length === 0) {
      this.feeds = this.api.getData();
      this.checkReadNews();
      store.feeds = this.feeds;
    }
  }

  render() {
    store.currentPage = Number(location.hash.substring(7) || 1);
    for (
      let i = (store.currentPage - 1) * 10;
      i < store.currentPage * 10;
      i++
    ) {
      const { read, id, title, comments_count, user, points, time_ago } =
        this.feeds[i];
      this.addHTML(`
      <div class="p-6 ${
        read ? 'bg-red-500' : 'bg-white'
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${id}">${title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${user}</div>
            <div><i class="fas fa-heart mr-1"></i>${points}</div>
            <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
    }

    this.setTemplateData('feed', this.getHTML());
    this.updateView();

    const pagination = document.querySelector('.pagination');
    const prevAnchor = document.querySelector('.prev');
    const nextAnchor = document.querySelector('.next');

    if (store.currentPage > 1) {
      const prev = document.createElement('a');
      prev.innerHTML = `<a href="#/page/${store.currentPage - 1}">Prev</a>`;
      if (prevAnchor) {
        pagination
          ? pagination.replaceChild(prev, prevAnchor)
          : console.error('요소를 찾을 수 없습니다.');
      } else {
        console.error('이전 페이지 요소를 찾을 수 없습니다.');
      }
    }

    if (store.currentPage < this.feeds.length / 10) {
      const next = document.createElement('a');
      next.innerHTML = `<a href="#/page/${store.currentPage + 1}">Next</a>`;
      if (nextAnchor) {
        pagination
          ? pagination.replaceChild(next, nextAnchor)
          : console.error('요소를 찾을 수 없습니다.');
      } else {
        console.error('다음 페이지 요소를 찾을 수 없습니다.');
      }
    }
  }

  private checkReadNews(): void {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = /* html */ `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold"><a href='#'>Hacker News</a></h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/${store.currentPage}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">
            {{content}}
          </div>
  
          {{__comments__}}
  
        </div>
      </div>
      `;

    super(containerId, template);
  }

  render() {
    const id = window.location.hash.split('/')[2];
    const api = new NewsDetailApi();
    const newsContent = api.getData(id);
    const readNews = store.feeds.find((item) => {
      return item.id === Number(id);
    });

    if (readNews) {
      readNews.read = true;
    }

    this.setTemplateData('comments', this.makeCommet(newsContent.comments));
    this.setTemplateData('title', newsContent.title);
    this.setTemplateData('content', newsContent.content);
    this.updateView();
  }

  makeCommet(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      this.addHTML(/* html */ `
        <div style="padding-left: ${comments[i].level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);
      if (comments[i].comments.length > 0) {
        this.addHTML(this.makeCommet(comments[i].comments));
      }
    }

    return this.getHTML();
  }
}

const router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
