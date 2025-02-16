class LiveCodeEditor
{
    constructor ()
    {
        this.htmlEditor = CodeMirror.fromTextArea(
            document.getElementById( "html-editor" ),
            {
                mode: "xml",
                theme: "material-darker",
                lineNumbers: true,
                autoCloseTags: true,
                autoCloseBrackets: true
            }
        );
        this.cssEditor = CodeMirror.fromTextArea(
            document.getElementById( "css-editor" ),
            {
                mode: "css",
                theme: "material-darker",
                lineNumbers: true,
                autoCloseTags: true,
                autoCloseBrackets: true
            }
        );
        this.jsEditor = CodeMirror.fromTextArea(
            document.getElementById( "js-editor" ),
            {
                mode: "javascript",
                theme: "material-darker",
                lineNumbers: true,
                autoCloseTags: true,
                autoCloseBrackets: true
            }
        );
        this.previewFrame = document.getElementById( "preview-frame" );
        this.runButton = document.getElementById( "run" );
        this.autoRunCheckbox = document.getElementById( "autoRun" );
        this.autoRunTimeout = null;

        this.init();
    }

    init ()
    {
        // Initialize auto-save
        this.loadSavedCode();

        // Event listeners
        this.runButton.addEventListener( "click", () => this.updatePreview() );

        // Auto-save on input
        this.htmlEditor.on( "change", () => this.saveCode() );
        this.cssEditor.on( "change", () => this.saveCode() );
        this.jsEditor.on( "change", () => this.saveCode() );

        // Keyboard shortcuts
        document.addEventListener( "keydown", ( e ) =>
        {
            if ( e.ctrlKey && e.key === "s" )
            {
                e.preventDefault();
                this.updatePreview();
            }
        } );

        // Initial preview
        this.updatePreview();

        // Enable auto-run
        this.enableAutoRun();

        // Restore auto-run preference
        const savedAutoRun = localStorage.getItem( "autoRun" );
        if ( savedAutoRun === "true" )
        {
            this.autoRunCheckbox.checked = true;
        }
    }

    updatePreview ()
    {
        const html = this.htmlEditor.getValue();
        const css = this.cssEditor.getValue();
        const js = this.jsEditor.getValue();

        const previewContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${ css }</style>
            </head>
            <body>${ html }
                <script>${ js }</script>
            </body>
            </html>
        `;

        const blob = new Blob( [ previewContent ], { type: "text/html" } );
        this.previewFrame.src = URL.createObjectURL( blob );
    }

    saveCode ()
    {
        const code = {
            html: this.htmlEditor.getValue(),
            css: this.cssEditor.getValue(),
            js: this.jsEditor.getValue()
        };
        localStorage.setItem( "savedCode", JSON.stringify( code ) );
    }

    loadSavedCode ()
    {
        const savedCode = localStorage.getItem( "savedCode" );
        if ( savedCode )
        {
            const code = JSON.parse( savedCode );
            this.htmlEditor.setValue( code.html );
            this.cssEditor.setValue( code.css );
            this.jsEditor.setValue( code.js );
        }
    }

    clearEditor ( type )
    {
        switch ( type )
        {
            case "html":
                this.htmlEditor.setValue( "" );
                break;
            case "css":
                this.cssEditor.setValue( "" );
                break;
            case "js":
                this.jsEditor.setValue( "" );
                break;
        }
        this.saveCode();
        this.updatePreview();
    }

    enableAutoRun ()
    {
        const editors = [ this.htmlEditor, this.cssEditor, this.jsEditor ];

        editors.forEach( ( editor ) =>
        {
            editor.on( "change", () =>
            {
                // Clear previous timeout
                clearTimeout( this.autoRunTimeout );
                // Set new timeout to run after 1 second of no typing
                if ( this.autoRunCheckbox.checked )
                {
                    this.autoRunTimeout = setTimeout( () => this.updatePreview(), 1000 );
                }
            } );
        } );

        // Save auto-run preference
        this.autoRunCheckbox.addEventListener( "change", ( e ) =>
        {
            localStorage.setItem( "autoRun", e.target.checked );
        } );
    }
}

// Initialize editor when DOM is loaded
document.addEventListener( "DOMContentLoaded", () =>
{
    window.editor = new LiveCodeEditor();
} );

// Expose clearEditor function globally
window.clearEditor = function ( type )
{
    window.editor.clearEditor( type );
};
