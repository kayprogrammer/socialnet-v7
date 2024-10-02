import { ICountry, Country as CountryModel, State as StateModel, City as CityModel } from '../models/accounts';
import { Country, State, City } from 'country-state-city';

const seedGeoData = async () => {
  try {
    if (!(await CountryModel.exists({}))) {
        // Insert countries
        const countries = Country.getAllCountries();
        const countryDocs = countries.map(c => ({
        name: c.name,
        code: c.isoCode,
        }));
        const insertedCountries = await CountryModel.insertMany(countryDocs);

        // Prepare states and cities data
        const stateDocs = [];
        const cityDocs: any[] = [];

        for (const country of insertedCountries) {
        const states = State.getStatesOfCountry(country.code);

        const stateMappings = states.map(s => ({
            name: s.name,
            country_: country._id, // Reference the country
            code: s.isoCode, // Keep isoCode for cities reference later
        }));

        // Accumulate the state documents
        stateDocs.push(...stateMappings);
        }
        // Insert states in bulk and get the inserted states
        let insertedStates = await StateModel.insertMany(stateDocs);
        // Populate country data into the inserted states
        let allInsertedStates = await StateModel.populate(insertedStates, { path: 'country' });

        for (const state of allInsertedStates) {
            const cities = City.getCitiesOfState((state.country_ as ICountry).code, state.code);
            const cityMappings = cities.map(c => ({
              name: c.name,
              state_: state.id,
            }));

            // Accumulate the state documents
            cityDocs.push(...cityMappings);
        }
    
        // Insert cities in bulk
        await CityModel.insertMany(cityDocs);
    }
    console.log('Seeding Geo-Data completed');
  } catch (error) {
    console.error('Error Seeding Geo-Data to the database:', error);
  }
};

export default seedGeoData