const express = require('express')
const cors = require('cors')

const rootRouter = require('./routes/route')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use('/api/v1', rootRouter)

app.get('/', (req, res) => {
  res.send('Express Server is Running')
})

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`)
})
