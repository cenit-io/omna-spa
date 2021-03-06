import React from 'react';
import {AccountConnection, FooterHelp, Card, Banner} from '@shopify/polaris';
import {OMNAComponent} from '../../common/OMNAComponent';

export class SetupStore extends OMNAComponent {
    constructor(props) {
        super(props);

        this.state.helpUri = 'https://omna.freshdesk.com/support/solutions/articles/43000169463-installing-and-activating-the-omna-application';
        this.state.sending = false;

        this.handleSaveDefaultProperties = this.handleSaveDefaultProperties.bind(this);
        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.handleAuthorize = this.handleAuthorize.bind(this);
    }

    handleChangeDefaultProperty(propertyName) {
        return this.handleChange('default_properties', propertyName)
    }

    handleSaveDefaultProperties() {
        const
            storeSettings = this.storeSettings,
            store = this.store,
            uri = this.urlTo('setup/default/properties'),
            data = this.requestParams({
                sch: store,
                default_properties: storeSettings.default_properties
            });

        this.loadingOn();
        this.setState({ sending: true });
        $.post(uri, data, 'json').done(() => {
            this.storeSettings.default_properties = data.default_properties;
            this.flashNotice('Default properties updated successfully in ' + store);
        }).fail((response) => {
            const error = response.responseJSON ? response.responseJSON.error : response.responseText;
            this.flashError('Failed to save default properties in ' + store + '. ' + error);
            console.error(response);
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    }

    handleDisconnect() {
        const store = this.store;

        const msg = 'Are you sure you want to disconnect OMNA from ' + store + '?';

        this.confirm(msg, (confirmed) => {
            if ( confirmed ) {
                const storeSettings = { connected: false, name: store };

                this.loadingOn();
                this.setState({ sending: true });
                $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
                    this.isConnected = false;
                }).fail((response) => {
                    const error = response.responseJSON ? response.responseJSON.error : response.responseText;
                    this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
                }).always(() => {
                    this.loadingOff();
                    this.setState({ sending: false });
                });
            }
        });
    }

    handleChange(attr1, attr2) {
        return (value) => this.setState((prevState) => {
            const storeSettings = this.storeSettings;

            if ( attr2 ) {
                storeSettings[attr1] = storeSettings[attr1] || {};
                storeSettings[attr1][attr2] = value
            } else {
                storeSettings[attr1] = value;
            }

            return prevState;
        });
    }

    handleConnect() {
        let storeSettings = this.storeSettings,
            store = this.store;

        storeSettings.connected = true;
        storeSettings.name = store;

        this.loadingOn();
        this.setState({ sending: true });

        $.getJSON(this.urlTo('setup'), this.queryParams({ setup: storeSettings })).done((response) => {
            this.isConnected = true;
        }).fail((response) => {
            const error = response.responseJSON ? response.responseJSON.error : response.responseText;
            this.flashError('Failed to setup ' + store + ' sales channel. ' + error);
        }).always(() => {
            this.loadingOff();
            this.setState({ sending: false });
        });
    }

    handleAuthorize() {
        let storeSettings = this.storeSettings,
            store = this.store;

        storeSettings.connected = true;
        storeSettings.name = store;

        open(this.urlTo('authorize?' + this.queryParams({ sch: store, settings: storeSettings })), '_parent')
    }

    get store() {
        return this.state.store
    }

    get storeName() {
        return this.channelName(this.store, false, true)
    }

    get storeSettings() {
        const store = this.store;

        this.channels[store] = this.channels[store] || {
            name: store,
            connected: false,
        };

        return this.channels[store]
    }

    get defaultProperties() {
        return this.storeSettings.default_properties
    }

    get isValid() {
        const storeSettings = this.storeSettings;

        return !Object.keys(storeSettings).find((attr) => storeSettings[attr] === null || storeSettings[attr] === '')
    }

    get isConnected() {
        return this.storeSettings.connected;
    }

    set isConnected(state) {
        this.storeSettings.connected = state;
    }

    renderAccount() {
        return null
    }

    renderDeprecated() {
        const deprecated = this.storeSettings.deprecated;

        if ( deprecated ) return <Card>{this.warn(deprecated)}</Card>
    }

    renderDefaultProperties() {
        return null
    }

    renderDetails() {
        const { sending } = this.state;

        let account, action, form;

        if ( this.isConnected ) {
            account = this.renderAccount();

            if ( (form = this.renderDefaultProperties()) ) {
                action = {
                    content: 'Save',
                    icon: 'save',
                    disabled: sending,
                    onAction: this.handleSaveDefaultProperties
                };
                form = <Banner title="Default properties">{form}</Banner>
            }
        } else {
            action = {
                content: 'Enable',
                icon: 'checkmark',
                disabled: sending || !this.isValid || this.isInactive,
                onAction: this.handleAuthorize
            };
            form = <Banner title="Connection data">{this.renderDataConnectionForm()}</Banner>
        }

        return (
            <Card primaryFooterAction={action}>{account}{form}</Card>
        )
    }

    renderWithAppContext(appContext) {
        const { helpUri, avatarUrl } = this.state;

        let disconnectAction, details,
            store = this.store,
            storeName = this.storeName;

        if ( this.isConnected ) {
            details = this.success('Is already enabled');
            disconnectAction = {
                content: 'Disable', icon: 'disable', destructive: true, onAction: this.handleDisconnect
            };
        } else {
            details = this.warn('Is not yet enabled');
        }

        return (
            <div className={'setup sale-channel ' + store + ' ' + (this.isConnected ? 'connected' : 'disconnected')}>
                {this.renderDeprecated()}
                <AccountConnection connected={this.isConnected} details={details} action={disconnectAction}
                                   accountName={'Synchronization with ' + storeName} avatarUrl={avatarUrl}
                                   termsOfService={this.renderDetails()}
                />
                <FooterHelp>
                    {'You can only have a single connection with a single ' + storeName + ' store. Learn more about '}
                    {this.renderExternalLink('how configure', helpUri)}
                    {' this store.'}
                </FooterHelp>
            </div>
        )
    }
}
