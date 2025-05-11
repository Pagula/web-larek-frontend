import { IEvents } from "./base/events";
import { Form } from "./common/Form";
import { ensureAllElements } from "../utils/utils";
import { IOrderForm } from "../types";
import { eventTriggers } from "../utils/constants";

export class Contacts extends Form<IOrderForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(phone: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = phone;
    }
    set email(email: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = email;
    }
}

export class Order extends Form<IOrderForm> {
    protected _buttons: HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
        this._buttons.forEach(button => {
            button.addEventListener('click', () => this.handlePayment(button, events));
        });
    };
    
    private handlePayment(clickedButton: HTMLButtonElement, events: IEvents) {
        this._buttons.forEach(button => {
            button.classList.toggle('button_alt-active', button === clickedButton);
        });
        events.emit(eventTriggers.paymentChange, { field: 'payment', value: clickedButton.name});
    };

    set address(address: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = address;
    }

    resetPaymentButtons() {
        this._buttons.forEach(button => {
            button.classList.remove('button_alt-active');
        });
    };
}
