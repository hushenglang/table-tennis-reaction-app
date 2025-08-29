# 🏓 Table Tennis Reaction Practice

A web application for training table tennis reflexes with random direction calls.

## Features

- **Multiple Practice Durations**: Choose from 1, 2, or 3 minute practice sessions
- **Random Direction Calls**: Random left/right directions with variable timing (1-1.5 seconds)
- **Visual Feedback**: Clear visual indicators with smooth animations
- **Practice Statistics**: Track total calls and average intervals
- **Keyboard Shortcuts**: Space to start/stop, Escape to go back, number keys for timer selection
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Local Development

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd table-tennis-reaction-app
   ```

2. Open `index.html` in your web browser or serve with a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Instructions:

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

3. **Automatic Deployment**:
   - The CI/CD pipeline will automatically trigger on:
     - Push to `main` branch
     - Pull requests to `main` branch
   - The workflow will build and deploy your site to GitHub Pages
   - Your site will be available at: `https://<username>.github.io/<repository-name>`

#### CI/CD Pipeline Details:

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes:

- **Build Job**: 
  - Checks out the code
  - Sets up GitHub Pages configuration
  - Uploads the site files as an artifact

- **Deploy Job**: 
  - Runs only on pushes to `main` branch
  - Deploys the artifact to GitHub Pages
  - Provides the deployment URL in the workflow output

## File Structure

```
table-tennis-reaction-app/
├── index.html          # Main HTML file
├── script.js           # JavaScript application logic
├── style.css           # Styles and animations
├── README.md           # This file
├── .gitignore          # Git ignore patterns
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow
```

## Usage

1. **Select Duration**: Choose your practice duration (1, 2, or 3 minutes)
2. **Start Practice**: Click "Start Practice" or press the Space bar
3. **Follow Directions**: React to the highlighted left (L) or right (R) boxes
4. **View Stats**: After completion, see your total calls and average interval

### Keyboard Shortcuts

- **Space**: Start/Stop practice
- **Escape**: Return to timer selection
- **1, 2, 3**: Quick select 1, 2, or 3 minute timers

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Styling**: CSS Grid, Flexbox, CSS Animations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
