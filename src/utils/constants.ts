export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export const eventTriggers = {
    //  корзина и товары //
    itemChanged: 'items:changed',
    basketChanged: 'basket:changed',
    basketOpen: 'basket:open',
    cardAdd: 'card:add',
    cardRemove: 'card:remove',
    // заказ и оформление //
    orderSubmit:'order:submit',
    orderOpen: 'order:open',
    formErrorsOrder: 'formErrorsOrder:change',
    orderChanged: /^order..*:change/,
    contactsSubmit: 'contacts:submit',
    formErrorsContact: 'formErrorsContact:change',
    contactsChanged: /^contacts..*:change/,
    paymentChange: 'payment:change',
    // модальные окна //
    modalOpen: 'modal:open',
    modalClose: 'modal:close',
    // предпросмотр, выбор товара //
    cardSelect: 'card:select',
    previewChanged: 'preview:changed',
};