export const Events = {
  // * To be deprecated
  BOOKING_TRANSACTION: 'booking_transaction',

  // * V2 Analytics
  SELECT_METRO: 'select_metro',
  SELECT_VEHICLE_CATEGORY: 'select_vehicle_category',
  SELECT_DATES: 'select_dates',
  SELECT_START_DATE: 'select_start_date',
  SELECT_END_DATE: 'select_end_date',
  DATES_AVAILABLE: 'dates_available',
  PROCEED_FROM_WIDGET: 'proceed_from_widget',
  NEXT_STEP: 'booking_funnel_step',
  APPLY_PROMO: 'apply_promo_code',
  SELECT_LOCATION_OPTION: 'change_location',
  SELECT_LOCATION_OPTION_AIRPORT: 'change_location_airport',
  ADD_ADDON: 'add_to_cart',
  REMOVE_ADDON: 'remove_from_cart',
  OPEN_ABANDON_MODAL: 'edit_modal_show',
  CLOSE_ABANDON_MODAL: 'edit_modal_continue',
  RESET_FROM_ABANDON_MODAL: 'edit_modal_reset',
  CLICK_AFFIRM_BUTTON: 'click_affirm_button',

  // AFFILIATE LINKS - INBOUND
  AFFILIATE_LINK_START: 'affiliate_link_start',

  // AFFILIATE LINKS - OUTBOUND
  AFFILIATE_LINK_MODAL_OPEN: 'affiliate_link_modal_open',
  AFFILIATE_LINK_MODAL_CLOSE: 'affiliate_link_modal_close',
  AFFILIATE_LINK_CLICK: 'affiliate_link_click',

  // SINGLE PAGE BOOKING
  SKIP_PRE_BOOKING_FORM: 'skip_pre_booking_form',
  SUBMIT_PRE_BOOKING_FORM: 'submit_pre_booking_form',
  VIEW_AMENITIES_CLICK: 'view_amenities_click',
  SUBMIT_USER_DETAILS_SECTION: 'submit_user_details_section',
  CREDIT_CARD_INPUT: 'credit_card_input',
  SUBMIT_BOOKING_COMPLETE_CLICK: 'submit_booking_complete_click',
};

export default {};
