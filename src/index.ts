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
import { Contacts, Order } from './components/Order';
import { Success } from './components/common/Success';



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
const orederTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');


const page = new Page(document.body,events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const card = new Card(cloneTemplate(cardCatalogTemplate));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const order = new Order(cloneTemplate(orederTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);


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

events.on(eventTriggers.basketOpen, () => {
    basket.selected = appData.order.items;
    modal.render({
        content: basket.render({
            total: appData.getTotal()
        }),
    });
});

events.on(eventTriggers.basketChanged, () => {
    basket.items = appData.basket.map((item, index) => {
        const card = new Card(cloneTemplate(cardBasketModal), {
            onClick:() => {
                appData.removeFromBasket(item);
                basket.selected = appData.order.items;
                basket.total = appData.getTotal();
            }
        });
        return card.render({
            title: item.title,
            price: item.price,
            index: index +1,
        });
    });
    page.counter = appData.basket.length;
    basket.total = appData.getTotal();
});

events.on(eventTriggers.cardAdd, (item: IProductItem) => {
    appData.addToBasket(item);
    modal.close();
});

events.on(eventTriggers.cardRemove, (item: IProductItem) => {
    appData.removeFromBasket(item);
    events.emit(eventTriggers.basketOpen);
});


events.on(eventTriggers.orderOpen, () => {
    modal.render({
        content: order.render({
            payment: '',
            address: '',
            valid: false,
            errors: [],
        }),
    });
});

events.on(eventTriggers.formErrorsOrder, (errors: FormErrors) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
});

events.on(eventTriggers.paymentChange, (data: { field: keyof IOrderForm; value: string }) => {
    appData.setOrderField(data.field, data.value);
});
events.on(eventTriggers.orderChanged, (data: { field: keyof IOrderForm; value: string}) => {
    appData.setOrderField(data.field, data.value);
});


events.on(eventTriggers.orderSubmit, () => {
    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: [],
        }),
    });
});

events.on(eventTriggers.formErrorsContact, (errors: FormErrors) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

events.on(eventTriggers.contactsChanged, (data: { field: keyof IOrderForm; value: string }) => {
    appData.setContactField(data.field, data.value);
});

events.on(eventTriggers.contactsSubmit, () => {
    api.orderCards(appData.order)
    .then((result) => {
        const success = new Success(cloneTemplate(successTemplate), {
            onClick: () => {
                modal.close();
            }
        });
        modal.render({
            content: success.render({
                total: appData.getTotal()
            })
        });
        appData.clearBasket();
        appData.clearOrder();
        page.counter = appData.basket.length;
    })
    .catch(err => {
        console.error(err);
    });
});



api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => { console.error(err);})