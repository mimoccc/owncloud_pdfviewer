function setEditorSize(){
	// Sets the size of the text editor window.
	fillWindow($('#editor'));
}

function getFileExtension(file){
	var parts=file.split('.');
	return parts[parts.length-1];
}

function setSyntaxMode(ext){
	// Loads the syntax mode files and tells the editor
	var filetype = new Array();
	// Todo finish these
    filetype["h"] = "c_cpp";
    filetype["c"] = "c_cpp";
    filetype["cpp"] = "c_cpp";
    filetype["clj"] = "clojure";
    filetype["coffee"] = "coffee"; // coffescript can be compiled to javascript
    filetype["cs"] = "csharp";
	filetype["css"] = "css";
    filetype["groovy"] = "groovy";
	filetype["html"] = "html";
    filetype["java"] = "java";
	filetype["js"] = "javascript";
    filetype["json"] = "json";
    filetype["ml"] = "ocaml";
    filetype["mli"] = "ocaml";
	filetype["pl"] = "perl";
	filetype["php"] = "php";
	filetype["py"] = "python";
	filetype["rb"] = "ruby";
    filetype["scad"] = "scad"; // seems to be something like 3d model files printed with e.g. reprap
    filetype["scala"] = "scala";
    filetype["scss"] = "scss"; // "sassy css"
    filetype["svg"] = "svg";
    filetype["textile"] = "textile"; // related to markdown
	filetype["xml"] = "xml";

	if(filetype[ext]!=null){
		// Then it must be in the array, so load the custom syntax mode
		// Set the syntax mode
		OC.addScript('files_texteditor','aceeditor/mode-'+filetype[ext], function(){
			var SyntaxMode = require("ace/mode/"+filetype[ext]).Mode;
			window.aceEditor.getSession().setMode(new SyntaxMode());
		});
	}	
}

function showControls(filename){
	// Loads the control bar at the top.
	$('.actions,#file_action_panel').fadeOut('slow').promise().done(function() {
		// Load the new toolbar.
		var savebtnhtml = '<input type="button" id="editor_save" value="'+t('files_texteditor','Save')+'">';
		var html = '<input type="button" id="editor_close" value="Close">';
		$('#controls').append(html);
		$('#editorbar').fadeIn('slow');	
		var breadcrumbhtml = '<div class="crumb svg" id="breadcrumb_file" style="background-image:url(&quot;../core/img/breadcrumb.png&quot;)"><p>'+filename+'</p></div>';
		$('.actions').before(breadcrumbhtml);
		$('.actions').before(savebtnhtml);
	});
}
 
function bindControlEvents(){
	$("#editor_save").live('click',function() {
		doFileSave();
	});	
	
	$('#editor_close').live('click',function() {
		hideFileEditor();	
	});
}

function viewerIsShown(){
	return is_editor_shown;
}

function updateSessionFileHash(path){
	$.get(OC.filePath('files_texteditor','ajax','loadfile.php'),
		{ path: path },
   		function(jsondata){
   			if(jsondata.status=='failure'){
   				alert('Failed to update session file hash.');	
   			}
   	}, "json");}

function doFileSave(){
	if(editorIsShown()){
	$('#editor_save').after('<img id="saving_icon" src="'+OC.filePath('core','img','loading.gif')+'"></img>');
		var filecontents = window.aceEditor.getSession().getValue();
		var dir =  $('#editor').attr('data-dir');
		var file =  $('#editor').attr('data-filename');
		$.post(OC.filePath('files_texteditor','ajax','savefile.php'), { filecontents: filecontents, file: file, dir: dir },function(jsondata){
			
			if(jsondata.status == 'failure'){
				var answer = confirm(jsondata.data.message);
				if(answer){
					$.post(OC.filePath('files_texteditor','ajax','savefile.php'),{ filecontents: filecontents, file: file, dir: dir, force: 'true' },function(jsondata){
						if(jsondata.status =='success'){
							$('#saving_icon').remove();
							$('#editor_save').after('<p id="save_result" style="float: left">Saved!</p>')
							setTimeout(function() {
  								$('#save_result').remove();
							}, 2000);
						} 
						else {
							// Save error
							$('#saving_icon').remove();
							$('#editor_save').after('<p id="save_result" style="float: left">Failed!</p>');
							setTimeout(function() {
								$('#save_result').fadeOut('slow',function(){ $(this).remove(); });
							}, 2000);	
						}
					}, 'json');
				} 
		   		else {
					// Don't save!
					$('#saving_icon').remove();
					// Temporary measure until we get a tick icon
					$('#editor_save').after('<p id="save_result" style="float: left">Saved!</p>');
					setTimeout(function() {
								$('#save_result').fadeOut('slow',function(){ $(this).remove(); });
					}, 2000);
			   	}
			} 
			else if(jsondata.status == 'success'){
				// Success
				$('#saving_icon').remove();
				// Temporary measure until we get a tick icon
				$('#editor_save').after('<p id="save_result" style="float: left">Saved!</p>');
				setTimeout(function() {
							$('#save_result').fadeOut('slow',function(){ $(this).remove(); });
				}, 2000);
			}
		}, 'json');
	giveEditorFocus();
	} else {
		return;	
	}	
};

function giveEditorFocus(){
	window.aceEditor.focus();
};

function showPDFviewer(dir,filename){
	if(!viewerIsShown()){
                $("#editor").hide();
                var url = OC.filePath('files','ajax','download.php')+'?files='+encodeURIComponent(filename)+"&dir="+encodeURIComponent(dir);
                console.log(url);
                $('table').hide();
                function im(path) { return OC.filePath('files_pdfviewer','js','pdfjs/web/images/'+path); }
                $("#controls").html($("#controls").html()+'&nbsp;&nbsp;<div id="controls2" style="display:inline;">      <button id="previous" onclick="PDFView.page--;" oncontextmenu="return false;">        <img src="'+im('go-up.svg')+'" align="top" height="10"/>        Previous      </button>      <button id="next" onclick="PDFView.page++;" oncontextmenu="return false;">        <img src="'+im('go-down.svg')+'" align="top" height="10"/>        Next      </button>      <div class="separator"></div>      <input type="number" id="pageNumber" onchange="PDFView.page = this.value;" value="1" size="4" min="1" />      <span>/</span>      <span id="numPages">--</span>      <div class="separator"></div>      <button id="zoomOut" title="Zoom Out" onclick="PDFView.zoomOut();" oncontextmenu="return false;">        <img src="'+im('zoom-out.svg')+'" align="top" height="10"/>      </button>      <button id="zoomIn" title="Zoom In" onclick="PDFView.zoomIn();" oncontextmenu="return false;">        <img src="'+im('zoom-in.svg')+'" align="top" height="10"/>      </button>      <div class="separator"></div>      <select id="scaleSelect" onchange="PDFView.parseScale(this.value);" oncontextmenu="return false;">        <option id="customScaleOption" value="custom"></option>        <option value="0.5">50%</option>        <option value="0.75">75%</option>        <option value="1">100%</option>        <option value="1.25">125%</option>        <option value="1.5" selected="selected">150%</option>        <option value="2">200%</option>        <option id="pageWidthOption" value="page-width">Page Width</option>        <option id="pageFitOption" value="page-fit">Page Fit</option>      </select>      <div class="separator"></div>      <button id="print" onclick="window.print();" oncontextmenu="return false;">        <img src="'+im('document-print.svg')+'" align="top" height="10"/>        Print      </button>      <button id="download" title="Download" onclick="PDFView.download();" oncontextmenu="return false;">        <img src="'+im('download.svg')+'" align="top" height="10"/>        Download      </button>       <span id="info">--</span>    </div>    <div id="sidebar">      <div id="sidebarBox">        <div id="sidebarScrollView">          <div id="sidebarView"></div>        </div>        <div id="outlineScrollView" hidden=\'true\'>          <div id="outlineView"></div>        </div>        <div id="sidebarControls">          <button id="thumbsSwitch" title="Show Thumbnails" onclick="PDFView.switchSidebarView(\'thumbs\')" data-selected>            <img src="'+im('nav-thumbs.svg')+'" align="top" height="10" alt="Thumbs" />          </button>          <button id="outlineSwitch" title="Show Document Outline" onclick="PDFView.switchSidebarView(\'outline\')" disabled>            <img src="'+im('nav-outline.svg')+'" align="top" height="10" alt="Document Outline" />          </button>        </div>     </div>    </div>    ');
                    $("#content").html($("#content").html()+'<div id="loading">Loading... 0%</div>    <div id="viewer"></div>');
                    /*function getScript(url, callback){  
        var head = document.documentElement,  
        script = document.createElement("script");  
        script.src = url;  
      
        var done = false;  
      
        //Attach handlers for all browsers  
        script.onload = script.onreadystatechange = function(){  
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){  
                done = true;  
      
                callback();  
      
                //handle memory leak in IE  
                script.onload = script.onreadystatechange = null;  
                if (head && script.parentNode) {  
                    head.removeChild(script);  
                }  
            }  
        };  
      
        //use insertBefore instead of appendChild to circumvent an IE6 bug.  
        //this arises when a base node is used  
        head.insertBefore(script,head.firstChild);  
      
        //we handle everything using the script element injection  
        return 'scriptinjected!';  
    }  
                OC.addScript('files_pdfviewer','pdfjs/build/pdf',function () {
                  OC.addStyle("files_pdfviewer","viewer");*/
                  PDFJS.workerSrc = OC.filePath('files_pdfviewer','js','pdfjs/build/pdf.js');
                  PDFView.open(url,1.5);//OC.addScript('files_pdfviewer','pdfview', function(data){ try{console.log(PDFView);}catch(err){eval(data);console.log(PDFView); }});
                //});
                //importScript(OC.filePath("files_pdfviewer","js","pdfview.js"));
                //console.log(PDFView);
                //OC.addScript('files_pdfviewer','pdfview', function(){console.log("Abab");PDFView.open(url,1.5);});});
                /*OC.addScript('files_pdfviewer','pdfjs/build/pdf', function(){
PDFJS.getPdf(url, function get(data) {
  PDFJS.workerSrc = OC.filePath('files_pdfviewer','js','pdfjs/build/pdf.js');
  //
  // Instantiate PDFDoc with PDF data
  //
  var pdf = new PDFJS.PDFDoc(data);
  var page = pdf.getPage(1);
  var scale = 1.5;

  //
  // Prepare canvas using PDF page dimensions
  //
  var canvas = document.getElementById('pdfembed');
  console.log(canvas);
  var context = canvas.getContext('2d');
  console.log(context);
  canvas.height = page.height * scale;
  canvas.width = page.width * scale;

  //
  // Render PDF page into canvas context
  //
  page.startRendering(context);
});
                        });*/
		// Loads the file editor and display it.
		/*var data = $.ajax({
				url: OC.filePath('files','ajax','download.php')+'?files='+encodeURIComponent(filename)+'&dir='+encodeURIComponent(dir),
				complete: function(data){
					// Initialise the editor
					updateSessionFileHash(dir+'/'+filename);
					showControls(filename);
					$('table').fadeOut('slow', function() {
						$('#editor').text(data.responseText);
						// encodeURIComponenet?
						$('#editor').attr('data-dir', dir);
						$('#editor').attr('data-filename', filename);
						window.aceEditor = ace.edit("editor");  
						aceEditor.setShowPrintMargin(false);
						setEditorSize();
						setSyntaxMode(getFileExtension(filename));
						OC.addScript('files_texteditor','aceeditor/theme-clouds', function(){
							window.aceEditor.setTheme("ace/theme/clouds");
						});
					});
				// End success
				}
				// End ajax
				});*/
		is_editor_shown = true;
	}
}

function hidePDFViewer(){
	// Fade out controls
	$('#editor_close').fadeOut('slow');
	// Fade out the save button
	$('#editor_save').fadeOut('slow');
	// Fade out breadcrumb
	$('#breadcrumb_file').fadeOut('slow', function(){ $(this).remove();});
	// Fade out editor
	$('#editor').fadeOut('slow', function(){
		$('#editor_close').remove();
		$('#editor_save').remove();
		$('#editor').remove();
		var editorhtml = '<div id="editor"></div>';
		$('table').after(editorhtml);
		$('.actions,#file_access_panel').fadeIn('slow');
		$('table').fadeIn('slow');	
	});
	is_editor_shown = false;
}

$(window).resize(function() {
	setEditorSize();
});
var is_editor_shown = false;
$(document).ready(function(){
	if(typeof FileActions!=='undefined'){
		FileActions.register('application/pdf','Edit','',function(filename){
			showPDFviewer($('#dir').val(),filename);
		});
		FileActions.setDefault('application/pdf','Edit');
	}
	OC.search.customResults.Text=function(row,item){
		var text=item.link.substr(item.link.indexOf('file=')+5);
		var a=row.find('a');
		a.data('file',text);
		a.attr('href','#');
		a.click(function(){
			var file=text.split('/').pop();
			var dir=text.substr(0,text.length-file.length-1);
			showFileEditor(dir,file);
		});
	}
	// Binds the file save and close editor events to the buttons
	bindControlEvents();
});