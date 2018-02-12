
var editable = true; //flag режима редактирования
var adminable = true; //flag режима администрирования
var is_preview = false; //flag режима предпросмотра
var debuggable = false; //debug flag
var scalable = true; //flag возможности масштабирования
var focused_node;
var passed_node;
var steps = []; // шаги для отмены
var snapRange = 1; //шаг сетки
