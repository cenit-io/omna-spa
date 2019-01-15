import React from 'react';
import {FormLayout, Select, DescriptionList} from '@shopify/polaris';
import {SetupStore} from './SetupStore'
import {LocationSelectBox} from '../../common/LocationSelectBox'
import logo from '../../images/lazada_logo.png';

export class SetupLazada extends SetupStore {
    constructor(props) {
        super(props);

        this.state.store = 'Lazada';
        this.state.avatarUrl = logo;
    }

    get isValid() {
        return this.state.storeSettings.location_id != null
    }

    renderAccount() {
        const
            account = this.state.appContext.settings.lazada_seller,
            storeSettings = this.state.storeSettings;

        return this.info('Seller account:',
            <DescriptionList items={[
                { term: 'Name:', description: account.name },
                { term: 'Company:', description: account.company },
                { term: 'Email:', description: account.email },
                { term: 'Domain:', description: storeSettings.lazada_domain.replace(/^api\./, '') }
            ]}/>
        );
    }

    renderDataConnectionForm() {
        const
            storeSettings = this.state.storeSettings,
            options = [
                { label: 'Singapore', value: 'api.lazada.sg' },
                { label: 'Malaysia', value: 'api.lazada.com.my' },
            ];

        return (
            <FormLayout>
                <Select label="Domain" options={options} value={storeSettings.lazada_domain}
                        onChange={this.handleChange('lazada_domain')}/>
                <LocationSelectBox id="lazada-location-id" value={storeSettings.lazada_location_id}
                                   onChange={this.handleChange('lazada_location_id')}/>
            </FormLayout>
        )
    }
}


