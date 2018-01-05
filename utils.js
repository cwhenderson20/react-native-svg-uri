export const camelCase = value =>
	value.replace(/-([a-z])/g, g => g[1].toUpperCase());

export const camelCaseNodeName = ({ nodeName, nodeValue }) => ({
	nodeName: camelCase(nodeName),
	nodeValue,
});

export const removePixelsFromNodeValue = ({ nodeName, nodeValue }) => ({
	nodeName,
	nodeValue: nodeValue.replace("px", ""),
});

export const transformStyle = ({ nodeName, nodeValue, fillProp }) => {
	if (nodeName === "style") {
		return nodeValue.split(";").reduce((acc, attribute) => {
			const [property, value] = attribute.split(":");
			if (property == "") return acc;
			else
				return {
					...acc,
					[camelCase(property)]:
						fillProp && property === "fill" ? fillProp : value,
				};
		}, {});
	}
	return null;
};

export const getEnabledAttributes = enabledAttributes => ({ nodeName }) =>
	enabledAttributes.includes(camelCase(nodeName));

export const extractStyleClasses = node => {
	if (node.nodeName === "style") {
		let stylesString = node.firstChild ? node.firstChild.nodeValue : "";
		let classArray = stylesString.split("}");

		return classArray.reduce((acc, classObj) => {
			let [classNamesString, style] = classObj.split("{");
			if (classNamesString === "") {
				return acc;
			}

			const rawClassNames = classNamesString.split(",");
			const classNames = rawClassNames.map(className =>
				className.trim().substring(1)
			);
			const classes = { ...acc };

			classNames.forEach(className => {
				if (className) {
					classes[className] = extractStyle(style);
				}
			});

			return classes;
		}, {});
	} else {
		if (node.childNodes) {
			let result = false;
			for (let i = 0; i < node.childNodes.length; i++) {
				result = extractStyleClasses(node.childNodes[i]);
				if (result) {
					return result;
				}
			}
		}

		return false;
	}
};

export const extractStyle = (style, fillProp) => {
	if (!style) {
		return {};
	}

	return style.split(";").reduce((acc, attribute) => {
		const [property, value] = attribute.split(":");
		if (property === "") {
			return acc;
		} else {
			return {
				...acc,
				[camelCase(property)]:
					fillProp && property === "fill" ? fillProp : value,
			};
		}
	}, {});
};
