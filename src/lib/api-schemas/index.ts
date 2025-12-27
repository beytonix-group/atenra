// Import all schema files to register endpoints with the registry
import './common.schemas';
import './auth.schemas';
import './billing.schemas';
import './admin.schemas';
import './company.schemas';
import './company-ops.schemas';
import './dashboard.schemas';
import './messaging.schemas';
import './paypal.schemas';
import './support.schemas';
import './misc.schemas';

// Re-export the registry and generator
export { registry, generateOpenAPIDocument, z } from './registry';
