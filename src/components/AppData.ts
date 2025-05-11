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



    checkProduct(id: string) {
        return !!this.basket.find((item) => item.id === id);
    }


}