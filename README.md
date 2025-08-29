# 🏓 Table Tennis Reaction Practice

A web application for training table tennis reflexes with random direction calls.

## Features

- **Multiple Practice Durations**: Choose from 1, 2, or 3 minute practice sessions
- **Random Direction Calls**: Random left/right directions with variable timing (1-1.5 seconds)
- **Enhanced Pose Detection**: AI-powered body movement tracking using MediaPipe
- **Real-time Movement Feedback**: Visual feedback for correct/incorrect body alignment
- **Calibration System**: Personalized movement sensitivity calibration
- **Pose Visualization**: Optional overlay showing detected body landmarks
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
   - Navigate to **Settings** → **Pages** (in left sidebar under "Code and automation")
   - Under "Source", select **GitHub Actions** (not "Deploy from a branch")
   - **Important**: If you don't see "GitHub Actions" option:
     - Make sure your repository is **public** OR you have GitHub Pro/Team
     - Ensure you have admin access to the repository

3. **Automatic Deployment**:
   - The CI/CD pipeline will automatically trigger on:
     - Push to `master` branch
     - Pull requests to `master` branch
   - The workflow will build and deploy your site to GitHub Pages
   - Your site will be available at: `https://<username>.github.io/<repository-name>`

#### CI/CD Pipeline Details:

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes:

- **Build Job**: 
  - Checks out the code
  - Sets up GitHub Pages configuration
  - Uploads the site files as an artifact

- **Deploy Job**: 
  - Runs only on pushes to `master` branch
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

1. **Setup Camera**: Allow camera access for pose-based movement tracking
2. **Configure Settings**: 
   - Toggle pose visualization overlay if desired
   - Adjust movement sensitivity using the slider
   - Run calibration to establish your baseline pose
3. **Select Duration**: Choose your practice duration (1, 2, or 3 minutes)
4. **Start Practice**: Click "Start Practice" or press the Space bar
5. **Follow Directions**: React to the highlighted left (L) or right (R) boxes with body movements
6. **Real-time Feedback**: See green borders for correct movements, red for incorrect
7. **View Stats**: After completion, see your total calls and average interval

### Movement Detection

The app uses advanced AI pose detection to track your body movements:
- **Arm Movements**: Extend your left/right arm to indicate direction
- **Body Lean**: Lean your body left or right for detection
- **Calibration**: Use the calibration feature for personalized accuracy
- **Sensitivity**: Adjust the movement threshold to match your range of motion

### Keyboard Shortcuts

- **Space**: Start/Stop practice
- **Escape**: Return to timer selection
- **1, 2, 3**: Quick select 1, 2, or 3 minute timers

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Styling**: CSS Grid, Flexbox, CSS Animations

## 🔧 Troubleshooting

### Common GitHub Pages Issues:

#### Error: "Pages site failed. Please verify that the repository has Pages enabled"

**Solution:**
1. **Check Repository Settings**:
   - Go to repository **Settings** → **Pages**
   - Ensure "Source" is set to **GitHub Actions**
   - Make sure repository is **public** (or you have GitHub Pro/Team)

2. **Verify Permissions**:
   - You need **admin access** to the repository
   - Check that Actions have **read/write permissions**

3. **Force Re-deployment**:
   - Go to **Actions** tab in your repository
   - Click on the failed workflow
   - Click **"Re-run all jobs"**

4. **Check Action Logs**:
   - Review the workflow logs for specific error messages
   - Look for permission or authentication issues

#### Other Common Issues:

- **404 Error on Site**: Wait 5-10 minutes after first deployment
- **CSS/JS Not Loading**: Check file paths are relative (no leading `/`)
- **Workflow Not Triggering**: Ensure you're pushing to `master` branch

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
