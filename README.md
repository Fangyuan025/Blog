# Fangyuan Lin — Personal Blog

A personal portfolio website for **Fangyuan Lin**, a Master of Engineering student at the University of Ottawa specializing in Electrical and Computer Engineering. The site showcases education, experience, and projects in Machine Learning, NLP, and software engineering.

🌐 **Live Site:** [fangyuan025.github.io/Blog](https://fangyuan025.github.io/Blog)

---

## Features

- **Bilingual Support** — Full English (`index.html`) and French (`index_fr.html`) versions of the site with a language toggle in the navigation bar.
- **Animated Hero Section** — Interactive particle canvas animation powered by JavaScript, combined with a typewriter text effect on the landing page.
- **Responsive Navigation** — Mobile-friendly hamburger menu that collapses/expands the nav links on smaller screens.
- **About Section** — A brief personal introduction highlighting interests in ML pipelines and dynamic web development.
- **Education Section** — Lists academic background including:
  - M.Eng. in Electrical & Computer Engineering, University of Ottawa (2024–Present)
  - B.Eng. in Telecommunication Engineering & Management, Queen Mary University of London / BUPT (2020–2024)
- **Experience Section** — Details key projects and professional roles:
  - Customer Complaint Classification system (multi-algorithm ML with SVM, XGBoost, Random Forest, etc.)
  - Sentiment Analysis from Text & Speech (~93% accuracy with tkinter GUI)
  - NLP Algorithm Intern at Emotibot Technology (LLaMA fine-tuning with QLoRA)
  - Sentiment Analysis in Online Education research project
- **Projects Section** — Filterable project cards with two categories:
  - **Chatbot** — Mock Interview Chatbot using fine-tuned open-source LLMs
  - **System** — Student Achievement Management System (Java)
- **Contact Section** — Displays email, phone, address, and LinkedIn profile. Includes a feedback form integrated with [Formspree](https://formspree.io) that submits asynchronously and enforces a 30-second cooldown to prevent duplicate submissions.

---

## Project Structure

```
Blog/
├── index.html          # English version of the portfolio
├── index_fr.html       # French version of the portfolio
├── CNAME               # Custom domain configuration for GitHub Pages
└── assets/
    ├── css/
    │   └── style.css   # Main stylesheet
    ├── js/             # JavaScript files (particles, typewriter, nav, filters)
    └── images/         # Image assets (e.g., project logos)
```

---

## Technologies Used

- **HTML5** — Semantic markup for all sections
- **CSS3** — Custom styling and responsive layout
- **Vanilla JavaScript** — Particle animation, typewriter effect, mobile menu toggle, project filtering, and async form submission
- **Formspree** — Backend-free contact/feedback form handling
- **GitHub Pages** — Static site hosting with a custom domain via CNAME

---

## Getting Started

To run the site locally:

```bash
git clone https://github.com/Fangyuan025/Blog.git
cd Blog
```

Then open `index.html` in your browser. No build tools or dependencies are required.

---

## Contact

- **Email:** flin025@uottawa.ca
- **LinkedIn:** [Fangyuan Lin](https://www.linkedin.com/in/fangyuan-lin-4b51b1336/)
- **GitHub:** [github.com/Fangyuan025](https://github.com/Fangyuan025)

---

© 2025 Fangyuan Lin. All rights reserved.
