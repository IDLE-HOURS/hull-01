import crypto from 'crypto'
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
})

export default async function send(req, res) {
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'must be a POST request' })
  }

  const {
    body: { audience, email, fname, lname },
  } = req

  // honeypot
  if (req.body.fullname !== '') {
    console.log('stuck in honey')
    return res.status(200).json({ status: 202 })
  }

  if (!email || !audience) {
    console.log('no email or audience ID provided')
    return res
      .status(404)
      .json({ error: 'must contain an email address and audience ID' })
  }

  const subHash = crypto.createHash('md5').update(email).digest('hex')

  const sendData = await mailchimp.lists.setListMember(audience, subHash, {
    email_address: email,
    status_if_new: 'subscribed',
  })

  res.statusCode = 200
  res.json({ sendData })
}
