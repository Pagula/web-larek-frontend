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



}