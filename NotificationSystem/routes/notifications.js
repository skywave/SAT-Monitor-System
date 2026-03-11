// /**
//  *
//  * GET  /api/notifications/config       — view active config (credentials masked)
//  * POST /api/notifications/test/email   — send a test email
//  * POST /api/notifications/test/webhook — send a test webhook
//  * POST /api/notifications/send         — manually dispatch a notification
//  */

// const express             = require('express');
// const router              = express.Router();
// const notificationService = require('../services/notificationService');

// // GET /api/notifications/config
// router.get('/config', (req, res) => {
//   try {
//     const result = notificationService.getConfig();
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST /api/notifications/test/email
// router.post('/test/email', async (req, res) => {
//   try {
//     const result = await notificationService.testEmail(req.body.to);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST /api/notifications/test/webhook
// router.post('/test/webhook', async (req, res) => {
//   try {
//     const result = await notificationService.testWebhook();
//     res.json(result);
//   } catch (err) {
//     res.status(err.statusCode || 500).json({ success: false, error: err.message });
//   }
// });

// // POST /api/notifications/send
// router.post('/send', async (req, res) => {
//   try {
//     const result = await notificationService.send(req.body);
//     res.json(result);
//   } catch (err) {
//     res.status(err.statusCode || 500).json({ success: false, error: err.message });
//   }
// });

// module.exports = router;
