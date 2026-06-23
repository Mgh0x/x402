const url = process.argv[2] || 'http://127.0.0.1:4021/api/health'
const response = await fetch(url)
const body = await response.json()
console.log(JSON.stringify({ status: response.status, body }, null, 2))
