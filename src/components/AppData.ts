import { Model } from "./base/Model";
import { FormErrors, IAppState, IOrder, IProductItem, IOrderForm, TPayment } from "../types";
import { eventTriggers } from "../utils/constants";

export type CatalogChangeEvent = {
    catalog: IProductItem[];
}

export class AppState extends Model<IAppState> {
    basket: IProductItem[] = [];
    catalog: IProductItem[];
    order: IOrder = {
        email: '',
        phone: '',
        items: [],
        payment: '',
        address: '',
        total: 0,
    };

    formErrors: FormErrors = {};

    getTotal() {
        return this.basket.reduce((total, item) => total + item.price, 0);
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items;
        this.emitChanges(eventTriggers.itemChanged, { catalog: this.catalog});
    }

    setPreview(item: IProductItem) {
        this.emitChanges(eventTriggers.previewChanged, item);
    }

    addToBasket(item: IProductItem) {
        if(!this.checkProduct(item.id)) {
            this.basket.push(item);
            this.order.items.push(item.id);
            this.order.total = this.order.total + item.price;
            this.emitChanges(eventTriggers.basketChanged);
        }
    }
    removeFromBasket(item: IProductItem) {
        this.basket = this.basket.filter((element) => element != item);
        this.order.items = this.order.items.filter((id: string) => item.id !== id);
        this.order.total = this.order.total - item.price;
        this.emitChanges(eventTriggers.basketChanged);
    }

    clearBasket() {
        this.basket = [];
        this.order.items = [];
        this.emitChanges(eventTriggers.basketChanged);
    }

    clearOrder() {
        this.order.address = '';
        this.order.email = '';
        this.order.payment = '';
        this.order.phone = '';
        this.order.total = 0;
    }


    checkProduct(id: string) {
        return !!this.basket.find((item) => item.id === id);
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }

        this.formErrors = errors;
        this.events.emit(eventTriggers.formErrorsContact, this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setContactField(field: keyof IOrderForm, value: string) {
        if ( field === 'email') {
            this.order.email = value;
        };
        if ( field === 'phone') {
            this.order.phone = value;
        };
        this.validateContacts();
    };


    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }

        this.formErrors = errors;
        this.events.emit(eventTriggers.formErrorsOrder, this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        if ( field === 'payment') {
            this.order.payment = value;
        };
        if ( field === 'address') {
            this.order.address = value;
        };
        this.validateOrder();
    };
}