<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output indent="yes"/>
<xsl:strip-space elements="*"/>

<xsl:template name="menu">
	<div>
		<xsl:attribute name="class">context-menu</xsl:attribute>
		<div class="cntnr">
		<xsl:for-each select="./*">
			<xsl:choose>
				<xsl:when test="@type='divider'"><div class="divider">&#160;</div></xsl:when>
				<xsl:otherwise>
					<div>
						<xsl:attribute name="data-id"><xsl:value-of select="@_id"/></xsl:attribute>
						<xsl:attribute name="class">menu-item
							<xsl:if test="count(./*) &gt; 0 or @invoke">hasSub</xsl:if>
							<xsl:if test="@checked = '1'">checked</xsl:if>
							<xsl:if test="@disabled">disabled</xsl:if>
						</xsl:attribute><xsl:value-of select="@name"/>

						<xsl:if test="count(./*) &gt; 0 or @invoke">
							<svg class="symbol-play"><use xlink:href="#symbol-play" /></svg>
						</xsl:if>
						<xsl:if test="@checked = '1'">
							<svg class="symbol-check"><use xlink:href="#symbol-check" /></svg>
						</xsl:if>
					</div>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>