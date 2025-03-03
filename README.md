# AI Model Comparison Tool

This project allows users to compare responses from three different AI models (OpenAI's GPT-4, Anthropic's Claude) side by side. It is built using Next.js with the **App Router** and features a simple frontend interface to enter a prompt and display AI-generated responses.

## 🚀 Features

- Compare outputs from **GPT-4**, **Claude**
- Built with **Next.js App Router**
- Uses API routes for backend requests
- Simple and clean UI

## 🛠️ Tech Stack

- **Frontend:** React (Next.js)
- **Backend:** Next.js API routes (App Router)
- **Requests:** Axios
- **Styling:** Tailwind CSS

---

## 📦 Installation

### **1. Clone the Repository**

```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### **2. Install Dependencies**

```sh
npm install
```

### **3. Set Up Environment Variables**

Create a **`.env.local`** file in the root directory and add:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Replace `your_openai_api_key` and `your_anthropic_api_key` with your actual API keys. Also make sure that you are using same version as is put down in route.ts in ai folder.

### **4. Run the Development Server**

```sh
npm run dev
```

The application will be available at **`http://localhost:3000`**.

---

## 🚀 Usage

1. Enter a prompt in the text area.
2. Click **"Generate Responses"**.
3. View AI responses from OpenAI and Claude side by side.

---

## 🔧 API Endpoints

This project includes a backend API to fetch AI responses.

- **POST `/api/ai`** → Sends a request to all three AI models and returns their responses.

**Example Request:**

```sh
curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d '{"prompt": "Tell me a joke"}'
```

**Example Response:**

```json
{
  "openai": "Why did the chicken cross the road? To get to the other side!",
  "claude": "What do you call fake spaghetti? An impasta!",
  "llama": "Knock, knock! Who’s there? Lettuce. Lettuce who? Lettuce in, it's cold out here!"
}
```

---

## ✅ Future Improvements

Add log in and place it online with ability to update the tokens individually

---

## 💡 Contributing

Feel free to submit issues and pull requests to improve the project!

---

## 📝 Notes

- Ensure you have valid API keys in `.env.local` before running the project.
- This project is for personal use only, and API costs may apply when using external services.
