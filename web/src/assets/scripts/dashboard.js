(function () {
  'use strict';

  // Configuration from Nunjucks template
  const config = window.dashboardConfig || {};

  // DOM elements module
  const DOM = {
    startSubscriptionButton: document.getElementById('start-subscription'),
    updatePaymentCardButton: document.getElementById('update-payment-card'),
    downloadDocumentButtons: document.getElementsByClassName('download-document'),
    templates: {
      success: '#success',
      cancelled: '#cancelled',
      updateSuccess: '#update-payment-card-success',
      updateCancelled: '#update-payment-card-cancel',
      loeSignedChangedServices: '#loe-signed-changed-services',
      loeSignedRenewal: '#loe-signed-renewal',
      documentConfirmEmail: '#document-confirm-email',
    },
  };

  // Initialize Stripe
  const stripe = Stripe(config.stripePublishableKey);

  // URL utilities
  const URLUtils = {
    getCurrentUrl: function () {
      return new URL(window.location.href);
    },

    getBaseUrl: function () {
      const url = this.getCurrentUrl();
      return `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}${url.pathname}`;
    },

    getParameter: function (paramName) {
      return this.getCurrentUrl().searchParams.get(paramName);
    },
  };

  // API module
  const API = {
    createCheckoutSession: function (clientId, baseUrl) {
      return axios.post('/.netlify/functions/create-checkout-session', {
        configuration: clientId,
        baseUrl: baseUrl,
      });
    },

    updatePaymentCard: function (customerId, subscriptionId, baseUrl) {
      return axios.post('/.netlify/functions/update-payment-card', {
        customerId: customerId,
        subscriptionId: subscriptionId,
        baseUrl: baseUrl,
      });
    },

    downloadHelpsheet: function (documentKey, email) {
      return axios.post('/.netlify/functions/download-helpsheet', {
        documentKey: documentKey,
        email: email,
      });
    },
  };

  // UI module
  const UI = {
    showButton: function (button) {
      if (button) {
        button.style.display = 'block';
      }
    },

    displayError: function (errorMessage) {
      Swal.fire({
        title: 'Sorry',
        icon: 'error',
        html: errorMessage,
      });
    },

    showAlert: function (templateId) {
      Swal.fire({
        template: templateId,
      });
    },

    redirectToCheckout: function (sessionId) {
      stripe.redirectToCheckout({ sessionId: sessionId }).then(function (result) {
        if (result.error) {
          UI.displayError(`<p>${result.error.message}</p>`);
        }
      });
    },

    showEmailConfirmation: function (documentKey, maskedEmail) {
      let message = `<p>To make sure only you can access the information in these helpsheets, please confirm the email address we have on file for you. The format is ${maskedEmail}</p><p>Please <a href="mailto:support@thenumberninja.co.uk">contact support</a> if you need to change the email address we have for you.</p>`;

      if (!maskedEmail) {
        message = `<p>To make sure only you can access the information in these helpsheets, we need to confirm your email address but we don't currently have one for you.</p><p>Please <a href="mailto:support@thenumberninja.co.uk">contact support</a> so we can update our records.</p>`;
      }

      Swal.fire({
        template: DOM.templates.documentConfirmEmail,
        input: 'email',
        html: message,
        inputPlaceholder: 'Enter your email address',
        inputAttributes: {
          autocomplete: 'email',
        },
        confirmButtonText: 'Confirm',
        preConfirm: email => {
          return API.downloadHelpsheet(documentKey, email)
            .then(response => response.data.url)
            .then(url => window.location.assign(url))
            .catch(async function (error) {
              const message =
                error.response?.data?.error ||
                'There was an unexpected problem downloading your helpsheet. Please try again later.';
              Swal.showValidationMessage(message);
            });
        },
      });
    },
  };

  // State handler module
  const StateHandler = {
    handleURLState: function () {
      const state = URLUtils.getParameter('state');

      // Default state (no state parameter)
      if (!state) {
        this.handleDefaultState();
        return;
      }

      // Map of state handlers
      const stateHandlers = {
        success: this.handleSuccessState,
        cancelled: this.handleCancelledState,
        'update-success': this.handleUpdateSuccessState,
        'update-cancelled': this.handleUpdateCancelledState,
        'loe-signed-renewal': this.handleLoeSignedRenewalState,
        'loe-signed-changed-services': this.handleLoeSignedChangedServices,
      };

      // Call the appropriate handler or default if not found
      if (stateHandlers[state]) {
        stateHandlers[state]();
      } else {
        this.handleDefaultState();
      }
    },

    handleDefaultState: function () {
      console.log(config);
      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      } else {
        UI.showButton(DOM.startSubscriptionButton);
      }
    },

    handleSuccessState: function () {
      UI.showAlert(DOM.templates.success);

      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      }
    },

    handleCancelledState: function () {
      UI.showAlert(DOM.templates.cancelled);
      UI.showButton(DOM.startSubscriptionButton);
    },

    handleUpdateSuccessState: function () {
      UI.showAlert(DOM.templates.updateSuccess);

      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      }
    },

    handleUpdateCancelledState: function () {
      UI.showAlert(DOM.templates.updateCancelled);

      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      }
    },

    handleLoeSignedRenewalState: function () {
      UI.showAlert(DOM.templates.loeSignedRenewal);

      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      }
    },

    handleLoeSignedChangedServices: function () {
      UI.showAlert(DOM.templates.loeSignedChangedServices);

      if (config.customerId && config.subscriptionId) {
        UI.showButton(DOM.updatePaymentCardButton);
      }
    },
  };

  // Error handling utility
  function handleAPIError(error, defaultMessage) {
    const errorMessage = error.response?.data?.error || defaultMessage;
    UI.displayError(`<p>${errorMessage}</p>`);
  }

  // Event handlers
  function handleStartSubscription() {
    const baseUrl = URLUtils.getBaseUrl();

    API.createCheckoutSession(config.clientId, baseUrl)
      .then(function (result) {
        UI.redirectToCheckout(result.data.session_id);
      })
      .catch(function (error) {
        handleAPIError(
          error,
          "Something unexpected happened there. We'll fix it as soon as possible so please try again later."
        );
      });
  }

  function handleUpdatePaymentCard() {
    const baseUrl = URLUtils.getBaseUrl();

    API.updatePaymentCard(config.customerId, config.subscriptionId, baseUrl)
      .then(function (result) {
        UI.redirectToCheckout(result.data.session_id);
      })
      .catch(function (error) {
        handleAPIError(
          error,
          "Something unexpected happened there. We'll fix it as soon as possible so please try again later."
        );
      });
  }

  function handleDocumentDownload(e) {
    e.preventDefault();
    const documentKey = this.dataset.documentKey;
    const maskedEmail = this.dataset.maskedEmail;

    UI.showEmailConfirmation(documentKey, maskedEmail);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Setup start subscription button
    if (DOM.startSubscriptionButton) {
      DOM.startSubscriptionButton.addEventListener('click', handleStartSubscription);
    }

    // Setup update payment card button
    if (DOM.updatePaymentCardButton) {
      DOM.updatePaymentCardButton.addEventListener('click', handleUpdatePaymentCard);
    }

    // Setup document download buttons
    Array.from(DOM.downloadDocumentButtons).forEach(button => {
      button.addEventListener('click', handleDocumentDownload);
    });
  }

  // Initialize the application
  function init() {
    StateHandler.handleURLState();
    setupEventListeners();
  }

  // Start the application when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', init);
})();
