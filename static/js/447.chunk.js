(this.webpackJsonpdxvote=this.webpackJsonpdxvote||[]).push([[447],{1402:function(t,n){!function(t){var n=/[*&][^\s[\]{},]+/,e=/!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,r="(?:"+e.source+"(?:[ \t]+"+n.source+")?|"+n.source+"(?:[ \t]+"+e.source+")?)";function a(t,n){n=(n||"").replace(/m/g,"")+"m";var e="([:\\-,[{]\\s*(?:\\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|]|}|\\s*#))".replace(/<<prop>>/g,(function(){return r})).replace(/<<value>>/g,(function(){return t}));return RegExp(e,n)}t.languages.yaml={scalar:{pattern:RegExp("([\\-:]\\s*(?:\\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\\2[^\r\n]+)*)".replace(/<<prop>>/g,(function(){return r}))),lookbehind:!0,alias:"string"},comment:/#.*/,key:{pattern:RegExp("((?:^|[:\\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)[^\r\n{[\\]},#\\s]+?(?=\\s*:\\s)".replace(/<<prop>>/g,(function(){return r}))),lookbehind:!0,alias:"atrule"},directive:{pattern:/(^[ \t]*)%.+/m,lookbehind:!0,alias:"important"},datetime:{pattern:a("\\d{4}-\\d\\d?-\\d\\d?(?:[tT]|[ \t]+)\\d\\d?:\\d{2}:\\d{2}(?:\\.\\d*)?[ \t]*(?:Z|[-+]\\d\\d?(?::\\d{2})?)?|\\d{4}-\\d{2}-\\d{2}|\\d\\d?:\\d{2}(?::\\d{2}(?:\\.\\d*)?)?"),lookbehind:!0,alias:"number"},boolean:{pattern:a("true|false","i"),lookbehind:!0,alias:"important"},null:{pattern:a("null|~","i"),lookbehind:!0,alias:"important"},string:{pattern:a("(\"|')(?:(?!\\2)[^\\\\\r\n]|\\\\.)*\\2"),lookbehind:!0,greedy:!0},number:{pattern:a("[+-]?(?:0x[\\da-f]+|0o[0-7]+|(?:\\d+\\.?\\d*|\\.?\\d+)(?:e[+-]?\\d+)?|\\.inf|\\.nan)","i"),lookbehind:!0},tag:e,important:n,punctuation:/---|[:[\]{}\-,|>?]|\.\.\./},t.languages.yml=t.languages.yaml}(Prism)}}]);
//# sourceMappingURL=447.chunk.js.map