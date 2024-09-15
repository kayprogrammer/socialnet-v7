import { SiteDetailSchema } from "../schemas/general";
import { generateSwaggerExample } from "./utils";
import { ERROR_EXAMPLE_500, SUCCESS_STATUS } from "./base";

export const siteDetailDocs = {
    get: {
        tags: ['General'],
        summary: 'Get site details',
        description: "Fetch details about the site like name, email, address, etc.",
        responses: {
            200: {
                description: 'Successful response',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'An example response',
                                value: {
                                    status: SUCCESS_STATUS,
                                    message: "Site details fetched",
                                    data: generateSwaggerExample(SiteDetailSchema)

                                },
                            },
                        },
                    },
                },
            },
            500: ERROR_EXAMPLE_500
        },
    }
};