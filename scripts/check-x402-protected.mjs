const url = process.argv[2] || 'http://127.0.0.1:4021/api/base-signal'
const response = await fetch(url)
const body = await response.text()
console.log(JSON.stringify({ status: response.status, paymentRequired: response.status === 402, body }, null, 2))
