<xsl:template name="authors">
	<h1>Authors</h1>
   
   <xsl:for-each select="//author">
      <xsl:value-of select="name"/><br/>
   </xsl:for-each>
</xsl:template>