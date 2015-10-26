$(document).ready(function() {
//Muestra la matriz que sale al inicio e indica al usuario el formato que el archivo debe de tener.
$('#formato').append('$$Formato\\,de\\,la\\,matriz\\,de\\,orden\\,n$$');
$('#formato').append('$$\\begin{array}{rrrrr} a_{11} & a_{12} & ... & a_{1n} & b_1 \\\\ a_{21} & a_{22} & ... & a_{2n} & b_2 \\\\ .&&&&. \\\\ .&&&&. \\\\ .&&&&. \\\\ a_{n1} & a_{n2} & ... & a_{nn} & b_n \\end{array}$$');
$('#formato').append('$$No\\,dejar\\,espacios\\,debajo\\,o\\,a\\,un\\,lado\\,de\\,la\\,matriz$$');
$('#fileDisplayArea').hide();
$('#ERRORES').hide()
//Funcion que se encarga de pedir el archivo y guardarlo en 'filedisplayarea' para luego ser transformado a matriz
window.onload = function() 
{
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	
	fileInput.addEventListener('change', function(e) {
		$('#fileDisplayArea').hide();
		var file = fileInput.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function(e) {
				fileDisplayArea.innerText = reader.result;
			}
			reader.readAsText(file);
		} else {
			$('#fileDisplayArea').show();
			fileDisplayArea.innerText = "Archivo no soportado";
		}
	});
}
//Funcion principal
$('#ordenar').click(function()
{
	try{
		var nr = $('input#redondeo').val()
		if ( HayEspaciosEnBlanco() ) throw "Espacios en blanco"
		if ( nr < 1 || nr != parseInt(nr) || nr > 15 ) throw "Buen redondeo"
		var n = $('input#orden').val()
		var arr
		//Obtengo el contenido de 'filedisplayarea' y reemplazo espacios,saltos de líneas,y demás a comas.
		arr = (fileDisplayArea.innerText).replace(/(\r\r)/gm,"\r")
		arr = (fileDisplayArea.innerText).replace(/(\r\n|\n|\r)/gm,",")
		arr = arr.replace(/[ ,]+/g, ",")
		arr = arr.split(',').map(Number)
		//Transformo eso a matriz
		arr = listToMatrix(arr,math.add(n,1))

		var dim = math.size(arr)
		//Checo si las dimensiones estan bien
		if ( dim[0] != n || dim[1] != math.add(n,1) ) throw "ValorN"
		//checo si cada renglon tiene n+1 elementos.
		for (var x in arr) 
			if (arr[x].length < math.add(n,1)) throw "MATRIZ INVALIDA"
		//Vacio todo lo que pueda tener en los 'campos'
		$('#matrices').empty()
		$('#vectores').empty()
		$('#formato').empty()
		$('#ERRORES').empty()
		//Redondeo la matriz entera al valor pedido de redondeo
		redondeaMatriz(arr)
		imprimirMatriz(arr,"matrices")
		escalaMatriz(arr)
		imprimirMatriz(arr,"matrices")
		if ( esDominante(arr) ) {

			//Creo una copia de la matriz para no alterar su contenido
			var copia1 = $.extend(true, [], arr)
			var vectorRespuesta = []
			var auxRespuesta = []
			llenaDeCeros(vectorRespuesta)
			var error
			var tolerancia = $('input#tolerancia').val()
			var limite = $('input#Errores').val()
			var contador = 0
			do{
				procedimientoGaussSeidel(vectorRespuesta,auxRespuesta,copia1)
				error = calculaError(vectorRespuesta, auxRespuesta)
				imprimirVector(vectorRespuesta,"vectores",error)
				++contador
			}while(error > tolerancia && contador < limite)
			if (contador>limite)throw "NO PUDE HACERLO"
		}else throw "LA MATRIZ SE QUEDA ASI"

		MathJax.Hub.Queue(["Typeset",MathJax.Hub])

	}catch(e) {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub])
		$('#ERRORES').show()
		$('#ERRORES').empty()
		switch ( e ) {
		case "ValorN": 
			$('#ERRORES').append('Error: El orden ingresado es distinto al que tiene la matriz ingresada o hay espacios debajo de la matriz o a la derecha.')
			break
		case "DIM ERROR": 
			$('#ERRORES').append('Error: La matriz ingresada es erronea, verifique si hay espacios por debajo o al lado de la matriz, o si le faltan elementos.')
			break
		case "NO HAY SOLUCION":
			$('#ERRORES').append('La matriz ingresada no se puede resolver')
			break
		case "MATRIZ INVALIDA":
			$('#ERRORES').append('Error: Formato de matriz inválido')
			break
		case "Espacios en blanco":
			$('#ERRORES').append('Error: Hay espacios en blanco')
			break
		case "Buen redondeo":
			$('#ERRORES').append('Error: El redondeo ingresado es extremadamente dificil.')
			break
		case "NO PUDE HACERLO":
			$('#ERRORES').append('Debido al valor de redondeo o al número permitido de repeticiones no pude calcular la respuesta con la tolerancia pedida, prueba con un valor de redondeo mayor')
			break
		case "NO PUEDO TRANSFORMARLO":
			$('#ERRORES').append('Error: La matriz no es diagonalmente dominante y no se puede transformar a diagonalmente dominante')
			break
		case "LA MATRIZ SE QUEDA ASI":
			$('#ERRORES').append('La matriz no es diagonalmente dominante y ha elegido no intentar transformarla')
			break
		default:
			$('#ERRORES').append('Error: No se ha encontrado un archivo')
		}
	}
})
function calculaError(vectorActual, vectorAnterior) 
{
	var nr = $('input#redondeo').val()
	var error = 0
	for (var x in vectorActual) 
		if (vectorActual[x] != 0)
			if (error < redondear ( (Math.abs( ( redondear( (vectorActual[x]-vectorAnterior[x]) , nr))/ redondear(vectorActual[x], nr )) ) , nr)) error = redondear ( (Math.abs( ( redondear( (vectorActual[x]-vectorAnterior[x]) , nr))/ redondear(vectorActual[x], nr )) ) , nr)
	return redondear (error*100 , nr)
}
function procedimientoGaussSeidel (vectorRespuesta, vectorAnterior, matriz) 
{
	copiaVector(vectorRespuesta, vectorAnterior)
	var nr = $('input#redondeo').val()
	var l = vectorRespuesta.length
	
	for (var x in vectorRespuesta){
		vectorRespuesta[x] = matriz[x][l]
		for (var i = 0; i < x; ++i) vectorRespuesta[x] -= redondear (  vectorRespuesta[i]*matriz[x][i],nr)
		for (var i = math.add(x,1); i < vectorRespuesta.length; ++i) vectorRespuesta[x] -= redondear ( vectorAnterior[i]*matriz[x][i],nr)
		vectorRespuesta[x] = redondear( vectorRespuesta[x]/matriz[x][x] ,nr)
	}
	
}
function copiaVector(original, copia) 
{
	var dim = $('input#orden').val()
	for (var x = 0; x < dim; ++x) copia[x] = original[x]
}
function llenaDeCeros(vector) 
{
	var dim = $('input#orden').val()
	for (var x = 0; x < dim; ++x) vector[x] = 0
}
//Checo si algún campo de los que pido está en blanco
function HayEspaciosEnBlanco() 
{
	if ($('#orden').val().length>0 && 
		$('#redondeo').val().length>0 &&
		$('#tolerancia').val().length>0 && 
		$('#Errores').val().length>0 )return false;
	return true;
}
function esDominante(matriz) 
{
	var lon = matriz.length
	var elementoDiagonal
	var sumaDelRenglon
	for (var x in matriz) {
		elementoDiagonal = Math.abs(matriz[x][x])
		sumaDelRenglon = 0
		for (var i = 0; i < x; ++i) sumaDelRenglon += Math.abs(matriz[x][i])
		for (var i = (math.add(x,1)); i < lon; ++i ) sumaDelRenglon += Math.abs(matriz[x][i])
		if ( elementoDiagonal < sumaDelRenglon ) return transformarADominante(matriz)
	}
	return true
}
function transformarADominante(matriz) 
{
	MathJax.Hub.Queue(["Typeset",MathJax.Hub])
	if ( !(confirm("Parece que la matriz no es dominante, ¿Desea que intente transformarla a dominante?")) ) return false

	var lon = matriz.length
	var arregloIndices = []
	var maxNumber
	var aux = []
	var auxNumber
	var indice
	for (var x in matriz) {
		maxNumber = 0
		indice = x
		for (var j = 0; j < lon; ++j) 
			if (maxNumber < Math.abs(matriz[x][j])) {
				maxNumber = Math.abs(matriz[x][j])
				indice = j
			}
		if(arregloIndices.indexOf(indice)!=-1) throw "NO PUEDO TRANSFORMARLO"
		arregloIndices[x] = indice	
	}
	for (var x in matriz) {
		if ( arregloIndices[x] != x ){
			aux = matriz[x]
			matriz[x] = matriz[arregloIndices[x]]
			matriz[arregloIndices[x]] = aux
			auxNumber = arregloIndices[x]
			arregloIndices[x] = arregloIndices[arregloIndices[x]]
			arregloIndices[auxNumber] = auxNumber
			imprimirMatriz(matriz,"matrices")
		}
	}
	var elementoenDiagonal
	var sumaDelRenglonac
	for (var x in matriz) {
		elementoenDiagonal = Math.abs(matriz[x][x])
		sumaDelRenglonac = 0
		for (var i = 0; i < x; ++i) sumaDelRenglonac += Math.abs(matriz[x][i])
		for (var i = (math.add(x,1)); i < lon; ++i ) sumaDelRenglonac += Math.abs(matriz[x][i])
		console.log(elementoenDiagonal, sumaDelRenglonac, "iteracion"+x)
		if ( elementoenDiagonal < sumaDelRenglonac ) throw "NO PUEDO TRANSFORMARLO"
	}

	return true	
}
//Funcion que redondea
function redondear (n,k)
{
	if(n === 0) return 0;
  	if(n < 0) return -(redondear(-n, k));
  	var mult = Math.pow(10, k - Math.floor(Math.log(n) / Math.LN10) - 1);
  	return Math.round(n * mult) / mult;
}
//Funcion que imprime vector
function imprimirVector(vector,ubicacion,error) {
	var rens = ""
	for (var i in vector ) rens+= vector[i] + "\\\\"
	$('#'+ubicacion+'').append('$$Vector\\,solucion:\\left[\\begin{array}{r}'+ rens +'\\end{array}\\right]con\\,error:'+error+'\\%$$')
}
//Funcion que imprime matriz
function imprimirMatriz(arreglo,ubicacion) 
{
	var n = $('input#orden').val()
	var renglones = ""
	for (var i in arreglo) renglones +="r"
	var rens = ""
	for (var i in arreglo){
		for (var j in arreglo[i]) rens += arreglo[i][j] + "&"
		rens = rens.substring(0,rens.length-1)
		rens += "\\\\"
	}
	rens = rens.substring(0,rens.length-2)
	$('#'+ubicacion+'').show()
	$('#'+ubicacion+'').append('$$-->\\left[\\begin{array}{'+renglones+'|r}'+ rens +'\\end{array}\\right]$$')	
}
//Funcion que transforma a matriz 
function listToMatrix(list, elementsPerSubArray) 
{
    var matrix = [], i, k;
    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }
    return matrix;
}
//Funcion para redondear una matriz
function redondeaMatriz(matriz) 
{
	var nr = $('input#redondeo').val()
	for (var x in matriz) 
		for (var j in matriz[x])
			matriz[x][j] = redondear(matriz[x][j],nr)	
}
function escalaMatriz( matriz ) 
{
	var numeroAlto
	var j
	var nr = $('input#redondeo').val()
	for (var i in matriz) {
		numeroAlto = Math.abs(matriz[i][0])
		j = 1
		for (j in matriz) if ( numeroAlto < Math.abs(matriz[i][j]) ) numeroAlto = Math.abs(matriz[i][j])
		if (numeroAlto === 0) throw "NO HAY SOLUCION"
		for (var k in matriz[i]) matriz[i][k] = redondear ( (matriz[i][k] / numeroAlto) ,nr )
	}
}
 });
