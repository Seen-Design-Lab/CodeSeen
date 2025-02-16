class LiveCodeEditor
{
    constructor ()
    {
        this.htmlEditor = document.getElementById( 'html-editor' );
        this.cssEditor = document.getElementById( 'css-editor' );
        this.jsEditor = document.getElementById( 'js-editor' );
        this.previewFrame = document.getElementById( 'preview-frame' );
        this.runButton = document.getElementById( 'run' );
        this.autoRunCheckbox = document.getElementById( 'autoRun' );
        this.autoRunTimeout = null;

        this.init();
    }

    init ()
    {
        // Initialize auto-save
        this.loadSavedCode();

        // Event listeners
        this.runButton.addEventListener( 'click', () => this.updatePreview() );

        // Auto-save on input
        this.htmlEditor.addEventListener( 'input', () => this.saveCode() );
        this.cssEditor.addEventListener( 'input', () => this.saveCode() );
        this.jsEditor.addEventListener( 'input', () => this.saveCode() );

        // Keyboard shortcuts
        document.addEventListener( 'keydown', ( e ) =>
        {
            if ( e.ctrlKey && e.key === 's' )
            {
                e.preventDefault();
                this.updatePreview();
            }
        } );

        // Initial preview
        this.updatePreview();

        // Setup tab behavior
        this.setupTabBehavior( this.htmlEditor );
        this.setupTabBehavior( this.cssEditor );
        this.setupTabBehavior( this.jsEditor );

        // Enable auto-run
        this.enableAutoRun();

        // Restore auto-run preference
        const savedAutoRun = localStorage.getItem( 'autoRun' );
        if ( savedAutoRun === 'true' )
        {
            this.autoRunCheckbox.checked = true;
        }
    }

    updatePreview ()
    {
        const html = this.htmlEditor.value;
        const css = this.cssEditor.value;
        const js = this.jsEditor.value;

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

        const blob = new Blob( [ previewContent ], { type: 'text/html' } );
        this.previewFrame.src = URL.createObjectURL( blob );
    }

    saveCode ()
    {
        const code = {
            html: this.htmlEditor.value,
            css: this.cssEditor.value,
            js: this.jsEditor.value
        };
        localStorage.setItem( 'savedCode', JSON.stringify( code ) );
    }

    loadSavedCode ()
    {
        const savedCode = localStorage.getItem( 'savedCode' );
        if ( savedCode )
        {
            const code = JSON.parse( savedCode );
            this.htmlEditor.value = code.html;
            this.cssEditor.value = code.css;
            this.jsEditor.value = code.js;
        }
    }

    setupTabBehavior ( editor )
    {
        editor.addEventListener( 'keydown', ( e ) =>
        {
            if ( e.key === 'Tab' )
            {
                e.preventDefault();

                const start = editor.selectionStart;
                const end = editor.selectionEnd;

                editor.value = editor.value.substring( 0, start ) + '    ' + editor.value.substring( end );
                editor.selectionStart = editor.selectionEnd = start + 4;
            }
        } );
    }

    clearEditor ( type )
    {
        switch ( type )
        {
            case 'html':
                this.htmlEditor.value = '';
                break;
            case 'css':
                this.cssEditor.value = '';
                break;
            case 'js':
                this.jsEditor.value = '';
                break;
        }
        this.saveCode();
        this.updatePreview();
    }

    enableAutoRun ()
    {
        const editors = [ 'html-editor', 'css-editor', 'js-editor' ];

        editors.forEach( editorId =>
        {
            const editor = document.getElementById( editorId );
            editor.addEventListener( 'input', () =>
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
        this.autoRunCheckbox.addEventListener( 'change', ( e ) =>
        {
            localStorage.setItem( 'autoRun', e.target.checked );
        } );
    }
}

// Initialize editor when DOM is loaded
document.addEventListener( 'DOMContentLoaded', () =>
{
    window.editor = new LiveCodeEditor();
} );

// Expose clearEditor function globally
window.clearEditor = function ( type )
{
    window.editor.clearEditor( type );
};