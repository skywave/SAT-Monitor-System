// scripts/generate-postman-collection.ts
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3000';

const collection = {
  info: {
    name: 'Yeastar PBX API - SAT Monitor',
    description: 'Complete Yeastar P-Series API collection with all endpoints',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    // =================== SYSTEM ===================
    {
      name: 'System',
      item: [
        { name: 'Get Information', request: { method: 'GET', url: `${BASE_URL}/api/system/information` } },
        { name: 'Get Capacity', request: { method: 'GET', url: `${BASE_URL}/api/system/capacity` } },
        { name: 'Get Menu Options', request: { method: 'GET', url: `${BASE_URL}/api/system/menuoptions` } },
        { 
          name: 'Send Email', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/system/sendemail`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ to: 'test@example.com', subject: 'Test', content: 'Test message' }) }
          } 
        },
      ],
    },

    // =================== EXTENSIONS ===================
    {
      name: 'Extensions',
      item: [
        { name: 'List Extensions', request: { method: 'GET', url: `${BASE_URL}/api/extension/list` } },
        { 
          name: 'Search Extensions', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'John' }) }
          } 
        },
        { 
          name: 'Get Extension', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Extensions', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Get Password', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/getpassword`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Create Extension', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ number: '100', name: 'Test User' }) }
          } 
        },
        { 
          name: 'Update Extension', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated Name' }) }
          } 
        },
        { 
          name: 'Delete Extension', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Send Welcome Email', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/extension/send_welcome_email`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
      ],
    },

    // =================== ORGANIZATIONS ===================
    {
      name: 'Organizations',
      item: [
        { name: 'List Organizations', request: { method: 'GET', url: `${BASE_URL}/api/organization/list` } },
        { 
          name: 'Search Organizations', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Sales' }) }
          } 
        },
        { 
          name: 'Get Organization', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Organizations', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Organization', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Department' }) }
          } 
        },
        { 
          name: 'Update Organization', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated Name' }) }
          } 
        },
        { 
          name: 'Delete Organization', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/organization/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== TRUNKS ===================
    {
      name: 'Trunks',
      item: [
        { name: 'List Trunks', request: { method: 'GET', url: `${BASE_URL}/api/trunk/list` } },
        { name: 'Get ITSP List', request: { method: 'GET', url: `${BASE_URL}/api/trunk/itsp_list` } },
        { 
          name: 'Search Trunks', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'trunk1' }) }
          } 
        },
        { 
          name: 'Get Trunk', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Trunks', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Trunk', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Trunk', type: 'sip' }) }
          } 
        },
        { 
          name: 'Update Trunk', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated Trunk' }) }
          } 
        },
        { 
          name: 'Delete Trunk', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/trunk/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== CONTACTS & PHONEBOOK ===================
    {
      name: 'Contacts & Phonebook',
      item: [
        { name: 'List Company Contacts', request: { method: 'GET', url: `${BASE_URL}/api/contact/company/list` } },
        { 
          name: 'Search Company Contacts', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'John' }) }
          } 
        },
        { 
          name: 'Get Company Contact', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Company Contacts', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Company Contact', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'John Doe', phone: '1234567890' }) }
          } 
        },
        { 
          name: 'Update Company Contact', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated Name' }) }
          } 
        },
        { 
          name: 'Delete Company Contact', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/company/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Phonebooks', request: { method: 'GET', url: `${BASE_URL}/api/contact/phonebook/list` } },
        { 
          name: 'Search Phonebooks', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Personal' }) }
          } 
        },
        { 
          name: 'Get Phonebook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Phonebooks', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Phonebook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Work Contacts' }) }
          } 
        },
        { 
          name: 'Update Phonebook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated Name' }) }
          } 
        },
        { 
          name: 'Delete Phonebook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/contact/phonebook/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== ROUTING ===================
    {
      name: 'Call Routing',
      item: [
        { name: 'List Inbound Routes', request: { method: 'GET', url: `${BASE_URL}/api/route/inbound/list` } },
        { 
          name: 'Search Inbound Routes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Main' }) }
          } 
        },
        { 
          name: 'Get Inbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Inbound Routes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Inbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Route' }) }
          } 
        },
        { 
          name: 'Update Inbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete Inbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/inbound/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Outbound Routes', request: { method: 'GET', url: `${BASE_URL}/api/route/outbound/list` } },
        { 
          name: 'Search Outbound Routes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'International' }) }
          } 
        },
        { 
          name: 'Get Outbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Outbound Routes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Outbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Route' }) }
          } 
        },
        { 
          name: 'Update Outbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete Outbound Route', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/route/outbound/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== VOICEMAIL ===================
    {
      name: 'Voicemail',
      item: [
        { 
          name: 'Query Voicemails', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ page: 1, page_size: 20 }) }
          } 
        },
        { 
          name: 'Get Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Download Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Create Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_id: '100' }) }
          } 
        },
        { 
          name: 'Update Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', read_status: 'read' }) }
          } 
        },
        { 
          name: 'Delete Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Delete Extension Voicemails', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/voicemail/delete_extension_vm`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_id: '100' }) }
          } 
        },
      ],
    },

    // =================== IVR & QUEUE ===================
    {
      name: 'IVR & Queue',
      item: [
        { name: 'List IVRs', request: { method: 'GET', url: `${BASE_URL}/api/ivr/list` } },
        { 
          name: 'Search IVRs', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Main IVR' }) }
          } 
        },
        { 
          name: 'Get IVR', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query IVRs', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create IVR', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New IVR' }) }
          } 
        },
        { 
          name: 'Update IVR', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete IVR', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/ivr/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Queues', request: { method: 'GET', url: `${BASE_URL}/api/queue/list` } },
        { 
          name: 'Search Queues', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Support' }) }
          } 
        },
        { 
          name: 'Get Queue', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Queues', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Queue', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Queue' }) }
          } 
        },
        { 
          name: 'Update Queue', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete Queue', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Queue Call Status', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/call_status`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ queue_id: '1' }) }
          } 
        },
        { 
          name: 'Queue Agent Status', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/agent_status`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ queue_id: '1' }) }
          } 
        },
        { name: 'Queue Pause Reason List', request: { method: 'GET', url: `${BASE_URL}/api/queue/pause_reason/list` } },
        { 
          name: 'Update Queue Pause Reason', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/pause_reason/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ reasons: [] }) }
          } 
        },
        { name: 'Get Queue Options', request: { method: 'GET', url: `${BASE_URL}/api/queue/option/get` } },
        { 
          name: 'Update Queue Options', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/option/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Honor Wrapup Time', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/honor_wrapup_time`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ enable: true }) }
          } 
        },
        { 
          name: 'Queue Agent Login', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/agent_login`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Queue Agent Pause', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/queue/agent_pause`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Agent Login', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/agent/login`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Agent Pause', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/agent/pause`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
      ],
    },

    // =================== CONFERENCE & PAGING ===================
    {
      name: 'Conference & Paging',
      item: [
        { name: 'List Conferences', request: { method: 'GET', url: `${BASE_URL}/api/conference/list` } },
        { 
          name: 'Search Conferences', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Weekly' }) }
          } 
        },
        { 
          name: 'Get Conference', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Conferences', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { name: 'Query Interim Conferences', request: { method: 'GET', url: `${BASE_URL}/api/conference/query_interim` } },
        { 
          name: 'View Password', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/viewpassword`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Ongoing Conferences', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/query_ongoing`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Create Conference', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Conference' }) }
          } 
        },
        { 
          name: 'Start Interim Conference', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/start_interim`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Invite Member', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/invite_member`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ conference_id: '1', member: '100' }) }
          } 
        },
        { 
          name: 'Kick Member', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/kick_member`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ conference_id: '1', member: '100' }) }
          } 
        },
        { 
          name: 'Mute Member', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/mute_member`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ conference_id: '1', member: '100' }) }
          } 
        },
        { 
          name: 'Unmute Member', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/unmute_member`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ conference_id: '1', member: '100' }) }
          } 
        },
        { 
          name: 'Update Conference', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete Conference', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Paging', request: { method: 'GET', url: `${BASE_URL}/api/conference/paging/list` } },
        { 
          name: 'Search Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Emergency' }) }
          } 
        },
        { 
          name: 'Get Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ name: 'New Paging' }) }
          } 
        },
        { 
          name: 'Update Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', name: 'Updated' }) }
          } 
        },
        { 
          name: 'Delete Paging', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/conference/paging/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== CALL CONTROL ===================
    {
      name: 'Call Control',
      item: [
        { 
          name: 'Query Calls', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Dial', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/dial`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ caller: '100', callee: '200' }) }
          } 
        },
        { 
          name: 'Accept Inbound', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/accept_inbound`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Refuse Inbound', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/refuse_inbound`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Listen', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/listen`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Hold', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/hold`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Unhold', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/unhold`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Mute', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/mute`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Unmute', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/unmute`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Park', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/park`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { name: 'Park Status', request: { method: 'GET', url: `${BASE_URL}/api/call/park_status` } },
        { 
          name: 'Forward to Voicemail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/forward_to_voicemail`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Transfer', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/transfer`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Add Member', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/add_member`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Play Prompt', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/play_prompt`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Hangup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/hangup`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Record Start', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/record_start`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Record Pause', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/record_pause`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Record Unpause', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/record_unpause`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'uaCSTA Accept', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/uacsta/accept`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'uaCSTA Refuse', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/uacsta/refuse`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'uaCSTA Hangup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/uacsta/hangup`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Get Call Notes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/notes/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1' }) }
          } 
        },
        { 
          name: 'Update Call Notes', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/call/notes/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ call_id: '1', notes: 'Test note' }) }
          } 
        },
      ],
    },

    // =================== RECORDING & CDR ===================
    {
      name: 'Recording & CDR',
      item: [
        { name: 'List Recordings', request: { method: 'GET', url: `${BASE_URL}/api/recording/list` } },
        { 
          name: 'Search Recordings', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/recording/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Download Recording', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/recording/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Play to Extension', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/recording/playtoextension`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1', extension_id: '100' }) }
          } 
        },
        { name: 'Get Auto Record', request: { method: 'GET', url: `${BASE_URL}/api/autorecord/get` } },
        { 
          name: 'Update Auto Record', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/autorecord/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { name: 'List CDRs', request: { method: 'GET', url: `${BASE_URL}/api/cdr/list` } },
        { 
          name: 'Search CDRs', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/cdr/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Download CDR', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/cdr/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { name: 'Get CDR Options', request: { method: 'GET', url: `${BASE_URL}/api/cdr/getoption` } },
        { 
          name: 'Update CDR Options', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/cdr/updateoption`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'List Call Reports', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/callreport/list`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Call Report Detail', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/callreport/detail`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Download Call Report', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/callreport/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { name: 'List Schedule Reports', request: { method: 'GET', url: `${BASE_URL}/api/callreport/schedule/list` } },
        { 
          name: 'Download Schedule Report', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/callreport/schedule/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== HOTEL ===================
    {
      name: 'Hotel',
      item: [
        { name: 'List Wake-up Calls', request: { method: 'GET', url: `${BASE_URL}/api/hotel/wakeupcall/list` } },
        { 
          name: 'Get Wake-up Call', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/wakeupcall/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_id: '100' }) }
          } 
        },
        { 
          name: 'Query Wake-up Calls', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/wakeupcall/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_ids: ['100', '101'] }) }
          } 
        },
        { 
          name: 'Create Wake-up Call', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/wakeupcall/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Update Wake-up Call', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/wakeupcall/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Delete Wake-up Call', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/wakeupcall/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_id: '100' }) }
          } 
        },
        { 
          name: 'Checkout', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/hotel/checkout`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ extension_ids: ['100'] }) }
          } 
        },
      ],
    },

    // =================== MONITORING ===================
    {
      name: 'Monitoring & Events',
      item: [
        { name: 'List Extension Status Monitor', request: { method: 'GET', url: `${BASE_URL}/api/monitor/extension_status/list` } },
        { 
          name: 'Update Extension Status Monitor', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/extension_status/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { name: 'List Trunk Status Monitor', request: { method: 'GET', url: `${BASE_URL}/api/monitor/trunk_status/list` } },
        { 
          name: 'Update Trunk Status Monitor', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/trunk_status/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Query Webhook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/webhook/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Update Webhook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/webhook/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Test Webhook', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/webhook/test`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ url: 'https://example.com/webhook' }) }
          } 
        },
        { name: 'Get Audio Stream', request: { method: 'GET', url: `${BASE_URL}/api/monitor/audiostream/get` } },
        { 
          name: 'Update Audio Stream', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/audiostream/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { name: 'List PIN Lists', request: { method: 'GET', url: `${BASE_URL}/api/monitor/pinlist/list` } },
        { 
          name: 'Search PIN Lists', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Get PIN List', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query PIN Lists', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create PIN List', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Update PIN List', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Delete PIN List', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/pinlist/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Block Numbers', request: { method: 'GET', url: `${BASE_URL}/api/monitor/blocknumbers/list` } },
        { 
          name: 'Search Block Numbers', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Get Block Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Block Numbers', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Block Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Update Block Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Delete Block Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/blocknumbers/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List Allow Numbers', request: { method: 'GET', url: `${BASE_URL}/api/monitor/allownumbers/list` } },
        { 
          name: 'Search Allow Numbers', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Get Allow Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Allow Numbers', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Create Allow Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Update Allow Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/update`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Delete Allow Number', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/monitor/allownumbers/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
      ],
    },

    // =================== STORAGE & BACKUP ===================
    {
      name: 'Storage & Backup',
      item: [
        { name: 'List Storage', request: { method: 'GET', url: `${BASE_URL}/api/storage/list` } },
        { name: 'List Backups', request: { method: 'GET', url: `${BASE_URL}/api/storage/backup/list` } },
        { 
          name: 'Search Backups', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/search`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Get Backup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/get`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Query Backups', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/query`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1', '2'] }) }
          } 
        },
        { 
          name: 'Get Backup Status', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/getstatus`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Download Backup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { 
          name: 'Create Backup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/create`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({}) }
          } 
        },
        { 
          name: 'Delete Backup', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/backup/delete`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ id: '1' }) }
          } 
        },
        { name: 'List System Logs', request: { method: 'GET', url: `${BASE_URL}/api/storage/systemlog/list` } },
        { 
          name: 'Download System Log', 
          request: { 
            method: 'POST', 
            url: `${BASE_URL}/api/storage/systemlog/download`,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: { mode: 'raw', raw: JSON.stringify({ ids: ['1'] }) }
          } 
        },
      ],
    },
  ],
};

// Write to file
fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 2));
console.log('✅ Postman collection generated: postman_collection.json');
console.log(`📊 Total endpoints: ${countEndpoints(collection)}`);

function countEndpoints(collection: any): number {
  let count = 0;
  collection.item.forEach((folder: any) => {
    count += folder.item.length;
  });
  return count;
}