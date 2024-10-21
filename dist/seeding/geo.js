"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_1 = require("../models/accounts");
const country_state_city_1 = require("country-state-city");
const seedGeoData = async () => {
    try {
        if (!(await accounts_1.Country.exists({}))) {
            // Insert countries
            const countries = country_state_city_1.Country.getAllCountries();
            const countryDocs = countries.map(c => ({
                name: c.name,
                code: c.isoCode,
            }));
            const insertedCountries = await accounts_1.Country.insertMany(countryDocs);
            // Prepare states and cities data
            const stateDocs = [];
            const cityDocs = [];
            for (const country of insertedCountries) {
                const states = country_state_city_1.State.getStatesOfCountry(country.code);
                const stateMappings = states.map(s => ({
                    name: s.name,
                    country_: country._id, // Reference the country
                    code: s.isoCode, // Keep isoCode for cities reference later
                }));
                // Accumulate the state documents
                stateDocs.push(...stateMappings);
            }
            // Insert states in bulk and get the inserted states
            let insertedStates = await accounts_1.State.insertMany(stateDocs);
            // Populate country data into the inserted states
            let allInsertedStates = await accounts_1.State.populate(insertedStates, { path: 'country' });
            for (const state of allInsertedStates) {
                const cities = country_state_city_1.City.getCitiesOfState(state.country_.code, state.code);
                const cityMappings = cities.map(c => ({
                    name: c.name,
                    state_: state.id,
                }));
                // Accumulate the state documents
                cityDocs.push(...cityMappings);
            }
            // Insert cities in bulk
            await accounts_1.City.insertMany(cityDocs);
        }
        console.log('Seeding Geo-Data completed');
    }
    catch (error) {
        console.error('Error Seeding Geo-Data to the database:', error);
    }
};
exports.default = seedGeoData;
//# sourceMappingURL=geo.js.map