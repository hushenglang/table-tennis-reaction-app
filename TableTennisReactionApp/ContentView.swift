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
        let webView = WKWebView()
        
        // Configure WebView settings
        webView.configuration.allowsInlineMediaPlayback = true
        webView.configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Load the local HTML file
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "WebContent"),
           let htmlURL = URL(string: htmlPath) {
            let request = URLRequest(url: htmlURL)
            webView.loadRequest(request)
        } else {
            // Fallback: load HTML content directly from bundle
            loadLocalHTML(in: webView)
        }
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // No updates needed
    }
    
    private func loadLocalHTML(in webView: WKWebView) {
        guard let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "WebContent"),
              let htmlContent = try? String(contentsOfFile: htmlPath) else {
            print("Failed to load HTML file")
            return
        }
        
        // Get the base URL for loading local resources
        let baseURL = URL(fileURLWithPath: htmlPath).deletingLastPathComponent()
        
        // Load the HTML content with the base URL
        webView.loadHTMLString(htmlContent, baseURL: baseURL)
    }
}

#Preview {
    ContentView()
}
