import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebView()
            .ignoresSafeArea()
    }
}

struct WebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        
        // Enable debugging for development
        #if DEBUG
        webView.isInspectable = true
        #endif
        
        // Load the local HTML file
        loadLocalHTML(in: webView)
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // No updates needed
    }
    
    private func loadLocalHTML(in webView: WKWebView) {
        guard let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "WebContent") else {
            print("❌ Failed to find HTML file in bundle")
            loadFallbackContent(in: webView)
            return
        }
        
        guard let htmlContent = try? String(contentsOfFile: htmlPath) else {
            print("❌ Failed to read HTML file content")
            loadFallbackContent(in: webView)
            return
        }
        
        // Get the base URL for loading local resources (CSS, JS, images)
        let baseURL = URL(fileURLWithPath: htmlPath).deletingLastPathComponent()
        
        print("✅ Loading HTML content with base URL: \(baseURL)")
        
        // Load the HTML content with the base URL so relative paths work
        webView.loadHTMLString(htmlContent, baseURL: baseURL)
    }
    
    private func loadFallbackContent(in webView: WKWebView) {
        let fallbackHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Table Tennis Reaction</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                    text-align: center; 
                    padding: 50px 20px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    margin: 0;
                }
                .container { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
                h1 { margin-bottom: 20px; }
                p { margin-bottom: 15px; opacity: 0.9; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏓 Table Tennis Reaction</h1>
                <p>App is loading...</p>
                <p>If this message persists, please check that the web content files are properly bundled with the app.</p>
            </div>
        </body>
        </html>
        """
        
        webView.loadHTMLString(fallbackHTML, baseURL: nil)
    }
}

#Preview {
    ContentView()
}
