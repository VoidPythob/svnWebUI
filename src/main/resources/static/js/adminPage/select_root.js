var orgUrl;
var rootSelect = {
	id: null,
	index: null,
	zTreeObj: null,
	setting: {
		async: {
			enable: true,
			dataType: "json",
			url: '',
			autoParam: ["id"]
		},
		data: {
			simpleData: {
				enable: true,
				idKey: 'id',
				pIdKey: 'pid',
				rootPId: ''
			}
		},
		check: {
			enable: true,
			chkStyle: "checkbox",
			chkboxType: { "Y": "", "N": "" }
		},
		callback: {
			onClick: function(event, treeId, treeNode) {
				var svnUrl = decodeURIComponent(treeNode.id);
				$("#svnUrl").html(svnUrl);
			}
		}
	},
	load: function() {
		rootSelect.zTreeObj = $.fn.zTree.init($("#rootSelect"), rootSelect.setting);
	},
	close: function() {
		layer.close(rootSelect.index);
	}
}

var load;
$(function() {
	layui.use('upload', function() {
		var upload = layui.upload;
		upload.render({
			elem: '#upload',
			url: '/adminPage/main/upload',
			accept: 'file',
			before: function(res) {
				load = layer.load();
			},
			done: function(res) {
				layer.close(load);
				// 上传完毕回调
				if (res.success) {
					sendFile(res.obj);
				}
			},
			error: function() {
				layer.close(load);
				// 请求异常回调
			}
		});
	});
})

function sendFile(filePath) {
	// 获取选中的路径
	var target = $("#svnUrl").html();
	var nodes = rootSelect.zTreeObj.getSelectedNodes();
	if (nodes.length > 0) {
		target = decodeURIComponent(nodes[0].id);
	}

	$.ajax({
		type: 'POST',
		url: ctx + '/adminPage/selectRoot/upload',
		data: {
			filePath: filePath,
			url: target
		},
		dataType: 'json',
		success: function(data) {
			if (data.success) {
				rootSelect.load();
			} else {
				layer.msg(data.msg);
			}
		},
		error: function() {
			layer.alert("出错了,请联系技术人员!");
		}
	});
}


function cancelSelect() {
	$("#svnUrl").html(orgUrl);
	
	rootSelect.zTreeObj.cancelSelectedNode();
}

function selectRoot(id, repositoryId) {
	rootSelect.id = id;

	$.ajax({
		type: 'POST',
		url: ctx + '/adminPage/repository/detail',
		data: {
			id: repositoryId
		},
		dataType: 'json',
		success: function(data) {
			if (data.success) {
				$("#selectOver").show();
				$("#selectRootOver").show();
				$("#uploadDiv").show();
				$("#mkdir").show();
				$("#rmfile").show();
				$("#download").hide();
				$("#rmfile").hide();

				showTree(data.obj.url, true);
			} else {
				layer.msg(data.msg);
			}
		},
		error: function() {
			layer.alert("出错了,请联系技术人员!");
		}
	});
}

function seeFile(url, permission) {
	$("#selectOver").hide();
	$("#selectRootOver").hide();
	$("#download").show();
	$("#rmfile").show();

	if (permission == 'rw') {
		$("#uploadDiv").show();
		$("#mkdir").show();
		$("#rmfile").show();
	} else {
		$("#uploadDiv").hide();
		$("#mkdir").hide();
		$("#rmfile").hide();
	}
	showTree(url, false);
}


function showTree(url, check) {
	$("#svnUrl").html(url);
	orgUrl = url;
	rootSelect.setting.async.url = ctx + '/adminPage/selectRoot/getFileList?url=' + encodeURIComponent(url) + "&guid=" + guid();
	rootSelect.setting.check.enable = check;
	rootSelect.load();
	rootSelect.index = layer.open({
		type: 1,
		title: "svn目录",
		area: ['800px', '600px'], // 宽高
		content: $('#rootSelectDiv')
	});
}


function mkdir() {
	layer.prompt({
		value: '',
		title: '文件夹名称',
		area: ['300px', '100px'] //自定义文本域宽高
	}, function(value, index, elem) {

		var target = $("#svnUrl").html() + "/" + value;
		var nodes = rootSelect.zTreeObj.getSelectedNodes();
		if (nodes.length > 0) {
			target = decodeURIComponent(nodes[0].id) + "/" + value;
		}

		$.ajax({
			type: 'POST',
			url: ctx + '/adminPage/selectRoot/mkdir',
			data: {
				url: target
			},
			dataType: 'json',
			success: function(data) {
				if (data.success) {
					layer.close(index); // 关闭prompt框
					rootSelect.load();
				} else {
					layer.msg(data.msg);
				}
			},
			error: function() {
				layer.alert("出错了,请联系技术人员!");
			}
		});

	});
}



function rmfile() {
	if (confirm("确认删除文件?")) {
		debugger
		// 获取选中的路径
		var value = '';
		var nodes = rootSelect.zTreeObj.getSelectedNodes();
		if (nodes.length > 0) {
			value = decodeURIComponent(nodes[0].id);
		}

		if (value == '') {
			layer.msg("未选中任何文件");
		}

		$.ajax({
			type: 'POST',
			url: ctx + '/adminPage/selectRoot/rmfile',
			data: {
				url: value
			},
			dataType: 'json',
			success: function(data) {
				if (data.success) {
					rootSelect.load();
				} else {
					layer.msg(data.msg);
				}
			},
			error: function() {
				layer.alert("出错了,请联系技术人员!");
			}
		});

	}
}





function selectOver() {
	var nodes = rootSelect.zTreeObj.getCheckedNodes();
	if (nodes.length > 0) {
		var arrays = [];
		for (let i = 0; i < nodes.length; i++) {
			if (!nodes[i].getCheckStatus().half) {

				var url = decodeURIComponent(nodes[i].id);

				var relativePaths = [];
				var urls = url.split("/");
				for (let i = 4; i < urls.length; i++) {
					relativePaths.push(urls[i]);
				}
				arrays.push("/" + relativePaths.join("/"));
			}
		}

		$("#" + rootSelect.id).val(arrays.join(";"));
	}
	layer.close(rootSelect.index);
}

function selectRootOver() {
	$("#" + rootSelect.id).val("/");
	layer.close(rootSelect.index);
}

function getSelectedFileNode() {
    var nodes = rootSelect.zTreeObj.getSelectedNodes();
    if (nodes.length === 0 || nodes[0].isParent) {
        layer.msg("请先选择一个文件");
        return null;
    }

    return nodes[0];
}

function download() {
    var node = getSelectedFileNode();
    if (!node) return;

    window.open(ctx + '/adminPage/selectRoot/download?url=' + encodeURIComponent(node.id));
}


function getExt(fileName) {
    var i = fileName.lastIndexOf(".");
    return i > -1 ? fileName.substring(i + 1).toLowerCase() : "";
}

function isTextLike(contentType, ext) {
    if (contentType.indexOf("text/") === 0) return true;
    if (contentType.indexOf("application/json") === 0) return true;
    if (contentType.indexOf("application/xml") === 0) return true;
    if (contentType.indexOf("application/javascript") === 0) return true;

    var textExts = [
        "txt", "log", "md", "markdown",
        "java", "js", "ts", "css", "html", "htm", "xml", "json",
        "sql", "sh", "bat", "py", "php", "c", "cpp", "h", "hpp",
        "yml", "yaml", "properties", "ini", "conf", "vue", "jsx", "tsx"
    ];
    return textExts.indexOf(ext) > -1;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}


function showImagePreview(blobUrl, fileName) {
    layer.open({
        type: 1,
        title: '预览 - ' + fileName,
        area: ['900px', '650px'],
        content: '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#2b2b2b;">' +
                 '<img src="' + blobUrl + '" style="max-width:100%;max-height:100%;"></div>',
        end: function() { URL.revokeObjectURL(blobUrl); }
    });
}

function showIframePreview(blobUrl, fileName) {
    layer.open({
        type: 1,
        title: '预览 - ' + fileName,
        area: ['900px', '650px'],
        content: '<iframe src="' + blobUrl + '" style="width:100%;height:100%;border:0;"></iframe>',
        end: function() { URL.revokeObjectURL(blobUrl); }
    });
}

function showVideoPreview(blobUrl, fileName) {
    layer.open({
        type: 1,
        title: '预览 - ' + fileName,
        area: ['900px', '650px'],
        content: '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#000;">' +
                 '<video src="' + blobUrl + '" controls style="max-width:100%;max-height:100%;"></video></div>',
        end: function() { URL.revokeObjectURL(blobUrl); }
    });
}

function showAudioPreview(blobUrl, fileName) {
    layer.open({
        type: 1,
        title: '预览 - ' + fileName,
        area: ['500px', '150px'],
        content: '<div style="height:100%;display:flex;align-items:center;justify-content:center;">' +
                 '<audio src="' + blobUrl + '" controls style="width:90%;"></audio></div>',
        end: function() { URL.revokeObjectURL(blobUrl); }
    });
}

function showTextPreview(blob, blobUrl, fileName, ext) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var text = e.target.result;
        var html;

        if (ext === 'md' || ext === 'markdown') {
            html = renderMarkdown(text);
        } else if (ext === 'txt' || ext === 'log') {
            html = renderPlainText(text);
        } else {
            html = renderCode(text, ext);
        }

        layer.open({
            type: 1,
            title: '预览 - ' + fileName,
            area: ['1200px', '700px'],
            content: html,
            end: function() { URL.revokeObjectURL(blobUrl); }
        });
    };
    reader.readAsText(blob, "UTF-8");
}

function renderMarkdown(text) {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'hljs language-'
    });
    return `<div class="md-preview">${marked.parse(text)}</div>`;
}

function renderPlainText(text) {
    var lines = text.split(/\r\n|\r|\n/);
    var numbers = '';
    for (var i = 1; i <= lines.length; i++) numbers += i + '\n';

    return '<div class="code-wrap">'
         +   '<div class="code-ln">' + numbers + '</div>'
         +   '<pre class="code-content">' + escapeHtml(text) + '</pre>'
         + '</div>';
}

function renderCode(text, ext) {
    var langMap = {
        'js': 'javascript', 'ts': 'typescript', 'jsx': 'javascript', 'tsx': 'typescript',
        'java': 'java', 'py': 'python', 'php': 'php',
        'css': 'css', 'html': 'xml', 'htm': 'xml', 'xml': 'xml', 'vue': 'xml',
        'json': 'json', 'sql': 'sql', 'sh': 'bash', 'bat': 'dos',
        'yml': 'yaml', 'yaml': 'yaml', 'properties': 'ini', 'ini': 'ini', 'conf': 'ini',
        'c': 'c', 'cpp': 'cpp', 'h': 'cpp', 'hpp': 'cpp'
    };
    var lang = langMap[ext] || null;

    var highlighted;
    if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(text, { language: lang }).value;
    } else {
        highlighted = hljs.highlightAuto(text).value;
    }

    var lines = text.split(/\r\n|\r|\n/);
    var numbers = '';
    for (var i = 1; i <= lines.length; i++) numbers += i + '\n';

    return '<div class="code-wrap">'
         +   '<div class="code-ln">' + numbers + '</div>'
         +   '<pre class="code-content"><code class="hljs">' + highlighted + '</code></pre>'
         + '</div>';
}

function preview() {
    var node = getSelectedFileNode();
    if (!node) return;

    var url = decodeURIComponent(node.id);
    var fileName = url.substring(url.lastIndexOf("/") + 1);

    var loading = layer.load();

    fetch(ctx + '/adminPage/selectRoot/preview?url=' + encodeURIComponent(node.id))
        .then(function(res) {
            var contentType = res.headers.get("Content-Type") || "";
            return res.blob().then(function(blob) {
                return { blob: blob, contentType: contentType };
            });
        })
        .then(function(result) {
            layer.close(loading);

            var blob = result.blob;
            var contentType = result.contentType;
            var blobUrl = URL.createObjectURL(blob);
            var ext = getExt(fileName);

            if (contentType.indexOf("image/") === 0) {
                showImagePreview(blobUrl, fileName);
            } else if (contentType.indexOf("application/pdf") === 0) {
                showIframePreview(blobUrl, fileName);
            } else if (contentType.indexOf("video/") === 0) {
                showVideoPreview(blobUrl, fileName);
            } else if (contentType.indexOf("audio/") === 0) {
                showAudioPreview(blobUrl, fileName);
            } else if (isTextLike(contentType, ext)) {
                showTextPreview(blob, blobUrl, fileName, ext);
            } else {
                URL.revokeObjectURL(blobUrl);
                layer.msg("该文件类型不支持预览，请下载查看");
            }
        })
        .catch(function(e) {
            layer.close(loading);
            console.log(e);
            layer.alert("出错了,请联系技术人员!");
        });
}


function copyUrl() {
	var textArea = document.createElement("textarea");
	textArea.style.position = 'fixed';
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.width = '2em';
	textArea.style.height = '2em';
	textArea.style.padding = '0';
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';
	textArea.style.background = 'transparent';
	textArea.value = $("#svnUrl").html();
	document.body.appendChild(textArea);
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? '成功复制到剪贴板' : '该浏览器不支持点击复制到剪贴板';
		layer.msg(msg);
	} catch (err) {
		layer.msg('该浏览器不支持点击复制到剪贴板');
	}

	document.body.removeChild(textArea);
}
