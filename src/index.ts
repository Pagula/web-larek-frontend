import './scss/styles.scss';
import { API_URL, CDN_URL, eventTriggers } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { FormErrors, IOrderForm, IProductItem } from './types';
import { EventEmitter } from './components/base/events';
import { Page } from './components/Page';
import { ProductAPI } from './components/ProductApi';
import { Card } from './components/Card';
import { Basket } from './components/common/Basket';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Modal } from './components/common/Modal';



const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

events.onAll(({ eventName, data}) => {
    console.log(eventName, data);
})

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketModal = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');


const page = new Page(document.body,events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const card = new Card(cloneTemplate(cardCatalogTemplate));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


events.on<CatalogChangeEvent>(eventTriggers.itemChanged, () => {
    page.catalog = appData.catalog.map((item) => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit(eventTriggers.cardSelect, item),
        });
        return card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
        });
    });
});

events.on(eventTriggers.cardSelect, (item: IProductItem) => {
    appData.setPreview(item);
});

events.on(eventTriggers.previewChanged, (item: IProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit(eventTriggers.cardAdd, item),
    });
    card.isButtonDisabled(appData.order.items, item.id, item.price);
    modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
            description: item.description,
        }),
    });
});

api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => { console.error(err);})