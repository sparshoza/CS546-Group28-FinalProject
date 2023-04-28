
		function showFields() {
			var courseFields = document.getElementById("courseFields").value;
			var fieldsContainer = document.getElementById("fieldsContainer");
			fieldsContainer.innerHTML = "";
			for (var i = 1; i <= courseFields; i++) {
				fieldsContainer.innerHTML += "Course " + i + ": <input type='text' name='field" + i + "'><br>";
			}
		}
	