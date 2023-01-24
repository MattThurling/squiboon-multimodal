import express from 'express'
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// GPT Completion
app.post("/api/completion", async (req, res) => {
  const topic = req.body.topic || ''
  if (topic.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid topic",
      }
    })
    return
  }
  let completion
  try {
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(topic),
      max_tokens: 500,
      temperature: 0.6,
    });
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API completion request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      })
    }
  }
  res
  .status(200)
  .json({
    question: completion.data.choices[0].text,
  })
})

// DALL-E
app.post("/api/dalle", async (req, res) => {
  const topic = req.body.topic || ''
  if (topic.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid topic",
      }
    })
    return
  }
  let dalle
  try {
    dalle = await openai.createImage({
      prompt: generateImagePrompt(topic),
      n: 1,
      size: "1024x1024",
    })
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API image request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      })
    }
  }
  res
  .status(200)
  .json({
    image: dalle.data.data[0].url,
  })
})
 
function generatePrompt(topic) {
  const capitalizedTopic = topic[0].toUpperCase() + topic.slice(1).toLowerCase();
  return `Give me an interesting open question about ${topic}.`;
}

function generateImagePrompt(topic) {
  return `Diverse old people ${topic}`;
}

export const handler = app;


